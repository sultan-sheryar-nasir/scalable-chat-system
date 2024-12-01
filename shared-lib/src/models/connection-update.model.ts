export interface ConnectionUpdate {
    type: 'connect' | 'disconnect';
    id: string;
    role: 'admin' | 'user';
}
