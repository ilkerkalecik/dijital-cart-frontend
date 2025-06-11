// src/components/ProfileSection.tsx
import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { api } from '../api';
import type { User, Yetenek, Proje, DtoSocialMediaResponse } from '../api';
import { SocialPlatform } from '../api';

interface LinkInput {
  platform: string;
  url: string;
}

export const ProfileSection: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [photoSrc, setPhotoSrc] = useState<string>();
  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    bio: '',
    job: ''
  });
  const [socialLinks, setSocialLinks] = useState<DtoSocialMediaResponse[]>([]);
  const [linkInputs, setLinkInputs] = useState<LinkInput[]>([]);
  const [newLink, setNewLink] = useState<LinkInput>({ platform: '', url: '' });
  const [skills, setSkills] = useState<Yetenek[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [projects, setProjects] = useState<Proje[]>([]);
  const [newProject, setNewProject] = useState({
    adi: '',
    aciklama: '',
    teknolojiler: '',
    projeLinki: '',
    gorselUrl: ''
  });
  const [file, setFile] = useState<File | null>(null);

  // 1) Kullanıcı verisini ve mevcut fotoğraf blob’unu yükle
  useEffect(() => {
    (async () => {
      const { data: userId } = await api.getCurrentUserId();
      const { data } = await api.getUserById(userId) as { data: User };
      setUser(data);
      setForm({
        name: data.name,
        surname: data.surname,
        email: data.email,
        password: '',
        bio: data.bio || '',
        job: data.job || ''
      });

      if (data.profilFoto) {
        try {
          const blob = await api.getUserPhoto(data.profilFoto);
          setPhotoSrc(URL.createObjectURL(blob));
        } catch {
          console.warn('Profil foto indirilemedi');
        }
      }

      const links = (await api.getSocialLinks()).data;
      setSocialLinks(links);
      setLinkInputs(links.map(l => ({ platform: l.platform, url: l.url })));

      setSkills((await api.getSkills()).data);
      setProjects((await api.listProjects()).data);
    })();

    return () => {
      if (photoSrc) {
        URL.revokeObjectURL(photoSrc);
      }
    };
  }, []);

  const handleFormChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.updateUser(
      form.name,
      form.surname,
      form.email,
      form.password,
      form.bio,
      form.job
    );
    alert('Profil güncellendi!');
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // 2) Yeni fotoğraf yükle ve blob olarak ekrana yansıt
  const handlePhotoUpload = async () => {
    if (!file || !user) return;
    const formData = new FormData();
    formData.append('file', file);
    const newUrl = await api.uploadProfilePhoto(formData);
    setUser({ ...user, profilFoto: newUrl });

    try {
      const blob = await api.getUserPhoto(newUrl);
      if (photoSrc) URL.revokeObjectURL(photoSrc);
      setPhotoSrc(URL.createObjectURL(blob));
    } catch {
      console.warn('Yeni fotoğraf blob indirilemedi');
    }
  };

  const handleLinkChange = (idx: number, url: string) => {
    setLinkInputs(prev =>
      prev.map((li, i) => (i === idx ? { ...li, url } : li))
    );
  };

  const handleLinkSave = async (platform: string, url: string) => {
    if (!url.trim()) return;
    await api.addOrUpdateSocialLink(platform, url.trim());
    const links = (await api.getSocialLinks()).data;
    setSocialLinks(links);
    setLinkInputs(links.map(l => ({ platform: l.platform, url: l.url })));
  };

  const handleNewLinkSave = async () => {
    if (!newLink.platform || !newLink.url.trim()) return;
    await api.addOrUpdateSocialLink(newLink.platform, newLink.url.trim());
    const links = (await api.getSocialLinks()).data;
    setSocialLinks(links);
    setLinkInputs(links.map(l => ({ platform: l.platform, url: l.url })));
    setNewLink({ platform: '', url: '' });
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    await api.addSkill(newSkill.trim());
    setSkills((await api.getSkills()).data);
    setNewSkill('');
  };

  const handleRemoveSkill = async (id: number) => {
    await api.removeSkill(id);
    setSkills((await api.getSkills()).data);
  };

  const handleAddProject = async () => {
    if (!newProject.adi.trim()) return;
    await api.addProject(
      newProject.adi,
      newProject.aciklama,
      newProject.teknolojiler,
      newProject.projeLinki,
      newProject.gorselUrl
    );
    setProjects((await api.listProjects()).data);
    setNewProject({
      adi: '',
      aciklama: '',
      teknolojiler: '',
      projeLinki: '',
      gorselUrl: ''
    });
  };

  const handleDeleteProject = async (id: number) => {
    await api.deleteProject(id);
    setProjects((await api.listProjects()).data);
  };

  if (!user) return <div>Yükleniyor...</div>;

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Profilim</h1>

      {/* Profil Fotoğrafı Bölümü */}
      <div className="flex flex-col items-center">
        {photoSrc ? (
          <img
            src={photoSrc}
            alt="Profil Fotoğrafı"
            className="w-32 h-32 rounded-full object-cover mb-2"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 mb-2 flex items-center justify-center">
            <span className="text-gray-500">Fotoğraf Yok</span>
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button
          onClick={handlePhotoUpload}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Fotoğraf Yükle
        </button>
      </div>

      {/* Kullanıcı Bilgileri Formu */}
      <form onSubmit={handleProfileSave} className="flex flex-col gap-2">
        <input
          value={form.name}
          onChange={e => handleFormChange('name', e.target.value)}
          placeholder="Ad"
          className="border p-2 rounded"
        />
        <input
          value={form.surname}
          onChange={e => handleFormChange('surname', e.target.value)}
          placeholder="Soyad"
          className="border p-2 rounded"
        />
        <input
          type="email"
          value={form.email}
          onChange={e => handleFormChange('email', e.target.value)}
          placeholder="Email"
          className="border p-2 rounded"
        />
        <input
          type="password"
          value={form.password}
          onChange={e => handleFormChange('password', e.target.value)}
          placeholder="Yeni Şifre"
          className="border p-2 rounded"
        />
        <input
          value={form.job}
          onChange={e => handleFormChange('job', e.target.value)}
          placeholder="İş"
          className="border p-2 rounded"
        />
        <textarea
          value={form.bio}
          onChange={e => handleFormChange('bio', e.target.value)}
          placeholder="Bio"
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-green-500 text-white py-2 rounded">
          Kaydet
        </button>
      </form>

      {/* Sosyal Medya Bölümü */}
      <div>
        <h2 className="text-xl font-semibold">Sosyal Medya</h2>
        {linkInputs.map((li, idx) => (
          <div key={li.platform} className="flex gap-2 items-center mb-2">
            <span className="w-24 font-medium">{li.platform}</span>
            <input
              className="border p-2 rounded flex-1"
              value={li.url}
              onChange={e => handleLinkChange(idx, e.target.value)}
            />
            <button
              onClick={() => handleLinkSave(li.platform, li.url)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Kaydet
            </button>
          </div>
        ))}
        <div className="flex gap-2 items-center mt-4">
          <select
            value={newLink.platform}
            onChange={e =>
              setNewLink(prev => ({ ...prev, platform: e.target.value }))
            }
            className="border p-2 rounded"
          >
            <option value="">Platform Seç</option>
            {Object.values(SocialPlatform).map(p =>
              !socialLinks.find(l => l.platform === p) ? (
                <option key={p} value={p}>
                  {p}
                </option>
              ) : null
            )}
          </select>
          <input
            value={newLink.url}
            onChange={e =>
              setNewLink(prev => ({ ...prev, url: e.target.value }))
            }
            placeholder="URL"
            className="border p-2 rounded flex-1"
          />
          <button
            onClick={handleNewLinkSave}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Ekle
          </button>
        </div>
      </div>

      {/* Yetenekler Bölümü */}
      <div>
        <h2 className="text-xl font-semibold">Yetenekler</h2>
        <div className="flex gap-2 mt-2">
          <input
            placeholder="Yeni yetenek"
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <button
            onClick={handleAddSkill}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Ekle
          </button>
        </div>
        <ul className="mt-2 list-disc list-inside">
          {skills.map(s => (
            <li
              key={s.id}
              className="flex justify-between items-center"
            >
              {s.aciklama}
              <button
                onClick={() => handleRemoveSkill(s.id)}
                className="text-red-500 ml-2"
              >
                Sil
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Projeler Bölümü */}
      <div>
        <h2 className="text-xl font-semibold">Projeler</h2>
        <div className="space-y-2 mt-2">
          {projects.map(p => (
            <div
              key={p.id}
              className="border p-3 rounded flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{p.adi}</h3>
                <p>{p.aciklama}</p>
                <a
                  href={p.projeLinki}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600"
                >
                  Link
                </a>
              </div>
              <button
                onClick={() => handleDeleteProject(p.id)}
                className="text-red-500"
              >
                Sil
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <input
            placeholder="Proje adı"
            value={newProject.adi}
            onChange={e =>
              setNewProject(prev => ({ ...prev, adi: e.target.value }))
            }
            className="border p-2 rounded w-full"
          />
          <textarea
            placeholder="Açıklama"
            value={newProject.aciklama}
            onChange={e =>
              setNewProject(prev => ({ ...prev, aciklama: e.target.value }))
            }
            className="border p-2 rounded w-full"
          />
          <input
            placeholder="Teknolojiler"
            value={newProject.teknolojiler}
            onChange={e =>
              setNewProject(prev => ({ ...prev, teknolojiler: e.target.value }))
            }
            className="border p-2 rounded w-full"
          />
          <input
            placeholder="Proje Linki"
            value={newProject.projeLinki}
            onChange={e =>
              setNewProject(prev => ({ ...prev, projeLinki: e.target.value }))
            }
            className="border p-2 rounded w-full"
          />
          <input
            placeholder="Görsel URL"
            value={newProject.gorselUrl}
            onChange={e =>
              setNewProject(prev => ({ ...prev, gorselUrl: e.target.value }))
            }
            className="border p-2 rounded w-full"
          />
          <button
            onClick={handleAddProject}
            className="bg-blue-500 text-white py-2 rounded w-full"
          >
            Proje Ekle
          </button>
        </div>
      </div>
    </div>
  );
};
