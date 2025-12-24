export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

export interface IsoPoint {
  x: number;
  y: number;
}

export interface CartPoint {
  x: number;
  y: number;
}

export function cartToIso(cartX: number, cartY: number): IsoPoint {
  return {
    x: (cartX - cartY) * (TILE_WIDTH / 2),
    y: (cartX + cartY) * (TILE_HEIGHT / 2),
  };
}

export function isoToCart(isoX: number, isoY: number): CartPoint {
  return {
    x: (isoX / (TILE_WIDTH / 2) + isoY / (TILE_HEIGHT / 2)) / 2,
    y: (isoY / (TILE_HEIGHT / 2) - isoX / (TILE_WIDTH / 2)) / 2,
  };
}

export function getTileAt(screenX: number, screenY: number, offsetX: number, offsetY: number): CartPoint {
  const adjustedX = screenX - offsetX;
  const adjustedY = screenY - offsetY;
  const cart = isoToCart(adjustedX, adjustedY);
  return {
    x: Math.floor(cart.x),
    y: Math.floor(cart.y),
  };
}
