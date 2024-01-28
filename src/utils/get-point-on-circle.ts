
type Point2D = [number, number];
export function getPointOnCircle(radius: number, angleRad: number, centerX = 0, centerY = 0): Point2D {
    const x = centerX + Math.cos(angleRad) * radius;
    const y = centerY + Math.sin(angleRad) * radius;
    return [x, y];
}


