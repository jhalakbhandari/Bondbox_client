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
  sessionId: { _id: string; label?: string };
  _id: string;
  text: string;
  createdAt: string;
  photo: string;
  audio: string;
  video: string;
};
export type Note = {
  _id: string;
  roomId: string;
  senderId: string;
  receiverId: string;
  type: "text" | "audio"; // can extend later
  content: string;
  audio?: string; // optional, present if type === "audio"
  createdAt: string;
  unlockedAt: string;
  isInstant: boolean;
  isRead: boolean;
  __v: number;
};
