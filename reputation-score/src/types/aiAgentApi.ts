export interface GetPostContextArgs {
    username: string;
    contentCreator: string;
    postText: string;
}

export interface PostContextResponse {
    context: string;
    explanation: string;
}
