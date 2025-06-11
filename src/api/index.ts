import axios from 'axios';

const instance = axios.create({
    baseURL: '/api',
    responseType: 'json',
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface User {
    id: number;
    name: string;
    surname: string;
    email: string;
    bio?: string;
    job?: string;
    profilFoto?: string | null;
}

export interface Message {
    id: number;
    content: string;
    sender: User;
    recipient: User;
    timestamp: string;
}

export interface SigninResponseDto {
    message: string;
    success: boolean;
}

export interface DtoSocialMediaResponse {
    platform: string;
    url: string;
}

export interface Proje {
    id: number;
    adi: string;
    aciklama: string;
    teknolojiler: string;
    projeLinki: string;
    gorselUrl: string;
}

export enum SocialPlatform {
    GITHUB = 'GITHUB',
    TWITTER = 'TWITTER',
    INSTAGRAM = 'INSTAGRAM',
    LINKEDIN = 'LINKEDIN',
}

export interface Yetenek {
    id: number;
    aciklama: string;
}

export const api = {
    // -------- AUTH --------
    login: (email: string, password: string) =>
        instance.post<SigninResponseDto>('/auth/login', { email, password }),

    signup: (name: string, surname: string, email: string, password: string) =>
        instance.post<SigninResponseDto>('/auth/signup', { name, surname, email, password }),

    getCurrentUserId: () =>
        instance.get<number>('/auth/current-user-id'),

    getUserById: (id: number) =>
        instance.get<User>(`/auth/list/${id}`),

    updateUser: (
        name: string,
        surname: string,
        email: string,
        password: string,
        bio: string,
        job: string
    ) =>
        instance.put<SigninResponseDto>('/auth/update', { name, surname, email, password, bio, job }),

    logout: () =>
        instance.post<SigninResponseDto>('/auth/logout'),

    uploadProfilePhoto: (formData: FormData): Promise<string> =>
        instance.put<string>('/auth/upload-photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(res => res.data) as Promise<string>,

    // Statik dosyaları blob olarak almak için
    getUserPhoto: (photoPath: string): Promise<Blob> => {
        // Ensure it begins with a slash:
        const normalized = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
        const url = `http://localhost:8080${normalized}`;
        return Promise.resolve(
            axios
                .get<Blob>(url, { responseType: 'blob' })
                .then(res => res.data)
        );
    },
    // ----- SOCIAL MEDIA -----
    getSocialLinks: () =>
        instance.get<DtoSocialMediaResponse[]>('/sosyal-medya'),

    addOrUpdateSocialLink: (platform: string, url: string) =>
        instance.post<void>('/sosyal-medya', { platform, url }),

    // ------- PROJELER -------
    addProject: (
        adi: string,
        aciklama: string,
        teknolojiler: string,
        projeLinki: string,
        gorselUrl: string
    ) =>
        instance.post<Proje>('/projeler/ekle', { adi, aciklama, teknolojiler, projeLinki, gorselUrl }),

    listProjects: () =>
        instance.get<Proje[]>('/projeler/listele'),

    updateProject: (
        id: number,
        adi: string,
        aciklama: string,
        teknolojiler: string,
        projeLinki: string,
        gorselUrl: string
    ) =>
        instance.put<Proje>(`/projeler/guncelle/${id}`, { adi, aciklama, teknolojiler, projeLinki, gorselUrl }),

    deleteProject: (id: number) =>
        instance.delete<void>(`/projeler/sil/${id}`),

    // ------- YETENEKLER -------
    getSkills: () =>
        instance.get<Yetenek[]>('/yetenekler/listele'),

    getAllUsers: () =>
        instance.get<User[]>('/auth/list'),

    addSkill: (aciklama: string) =>
        instance.post<string>('/yetenekler/ekle', { aciklama }),

    removeSkill: (yetenekId: number) =>
        instance.delete<string>(`/yetenekler/sil/${yetenekId}`),

    // ------- MESSAGES -------
    sendMessage: (recipientId: number, text: string) =>
        instance.post<Message>('/message', { recipientId, text }),

    getConversation: (otherUserId: number) =>
        instance.get<Message[]>(`/conversation?otherUserId=${otherUserId}`),
};
