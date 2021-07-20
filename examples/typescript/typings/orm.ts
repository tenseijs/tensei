declare module '@tensei/orm' {
  export interface PostRepository {
    scrapeAllWithUsers: () => Promise<number[]>
  }
}
