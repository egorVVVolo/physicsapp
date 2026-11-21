// Stress, strain and the Young modulus (WPH11 points 28 and 31). A load F on a wire of cross-section A and length L:
// stress σ = F ÷ A (Pa), strain ε = Δx ÷ L (no unit), Young modulus E = σ ÷ ε (Pa), a property of the material.
// The wire stretches by Δx = FL ÷ (AE): longer means more, thicker means less, and the area goes as d².
// Hooke's k belongs to the object: k = EA ÷ L. In the lab E = (gradient of F against Δx) × L ÷ A.

/** The Young modulus of steel in this course, Pa. */
export const E_STEEL = 2.1e11;

/** The area (m²) of a circle of diameter d (m): πd² ÷ 4. */
export function circleArea(d: number): number {
  return (Math.PI * d * d) / 4;
}

/** The tensile stress (Pa): force per unit cross-sectional area, σ = F ÷ A. */
export function stress(F: number, A: number): number {
  return F / A;
}

/** The tensile strain (no unit): the extension per unit original length, ε = Δx ÷ L. */
export function strain(dx: number, L: number): number {
  return dx / L;
}

/** The Young modulus (Pa): stress ÷ strain. */
export function youngModulus(sigma: number, epsilon: number): number {
  return sigma / epsilon;
}

/** The extension (m) of a wire of length L (m) and area A (m²) of Young modulus E (Pa) under a load F (N): FL ÷ (AE). */
export function wireExtension(F: number, L: number, A: number, E: number): number {
  return (F * L) / (A * E);
}

/** The stiffness k (N m⁻¹) of a wire as an object: EA ÷ L. */
export function wireStiffness(E: number, A: number, L: number): number {
  return (E * A) / L;
}

/** The Young modulus (Pa) from the gradient k (N m⁻¹) of a force–extension graph of a wire of length L and area A: kL ÷ A. */
export function youngFromGradient(k: number, L: number, A: number): number {
  return (k * L) / A;
}
