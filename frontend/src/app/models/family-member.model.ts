export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  total_points: number;
  user_id: string;
  created_at: string;
}

export interface CreateMemberRequest {
  name: string;
  avatar?: string;
}

export interface UpdateMemberRequest {
  name?: string;
  avatar?: string;
}

export interface LeaderboardMember extends FamilyMember {
  rank: number;
}
