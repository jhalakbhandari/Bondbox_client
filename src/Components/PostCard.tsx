import type { Post } from "../types";

const PostCard = ({ post, flip }: { post: Post; flip: boolean }) => (
  <div
    className={`mb-8 flex w-full flex-col items-center sm:flex-row ${
      flip ? "sm:flex-row" : "sm:flex-row-reverse"
    }`}
  >
    <div className="post flex flex-col w-full sm:w-1/2 px-2">
      <div className="post-content bg-white/80 rounded-xl p-4 shadow-md w-full">
        {post.text && <p className="text-gray-800 pb-4">{post.text}</p>}
        {post.photo && (
          <img src={post.photo} alt="Post" className="mt-2 rounded-xl" />
        )}
        {post.audio && (
          <audio controls className="mt-2 w-full">
            <source src={post.audio} />
          </audio>
        )}
        {post.video && (
          <video controls className="mt-2 rounded-xl w-full">
            <source src={post.video} />
          </video>
        )}
        <span className="text-xs text-gray-500 mt-1 block">
          {new Date(post.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  </div>
);
export default PostCard;
