export function buildPath(route: string): string {
    if (import.meta.env.MODE === 'production') {
        return 'https://cards.lamp.lilialvarado.com/' + route;
    } else {
        return 'http://localhost:5000/' + route;
    }
}