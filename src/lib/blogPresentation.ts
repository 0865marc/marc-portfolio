import type { BlogPost } from '../data/blog'

export const getLandingBlogPosts = (posts: readonly BlogPost[]): BlogPost[] => posts.slice(0, 3)
