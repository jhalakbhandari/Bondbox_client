// Room type
export type User = {
  _id: string;
  email: string;
  name?: string;
};
export type Room = {
  _id: string;
  name: string;
  code: string;
  users: User[];
};

// Post type
export type Post = {
  sessionId: any;
  _id: string;
  text: string;
  createdAt: string;
  photo: string;
  audio: string;
  video: string;
};
