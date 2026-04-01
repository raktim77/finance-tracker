export type Profile =  {
    avatar_url: string | null;
    bio: string
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile:Profile;
}

export interface UpdateProfilePayload {
  name?: string;
  avatar_url?: string | null;
}


export interface getMeResponse { 
    ok:boolean;
    user: UserProfile
}
