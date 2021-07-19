declare module '@tensei/orm' {
    export interface PostEntityRepository {
        scrapeAllWithUsers: () => Promise<number[]>
    }
}
