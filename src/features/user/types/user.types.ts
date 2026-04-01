export type Profile =  {
    avatar_url: string | null;
    bio: string
}

type oAuthProvider = {
    provider: string;
    provider_id: string
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile:Profile;
  oauth_providers: oAuthProvider[]
}

export interface UpdateProfilePayload {
  name?: string;
  avatar_url?: string | null;
}


export interface getMeResponse { 
    ok:boolean;
    user: UserProfile
}
