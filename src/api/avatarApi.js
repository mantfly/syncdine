export function generateSeed() {
    return Math.random().toString(36).substring(7);
}
export function getAvatarUrl(seed) {
    return `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}`;
}

