declare module "@paper-design/shaders" {
  export const liquidMetalFragmentShader: string;

  export class ShaderMount {
    constructor(
      element: HTMLElement,
      fragmentShader: string,
      uniforms?: Record<string, number>,
      vertexShader?: string,
      speed?: number,
    );

    setSpeed?(speed: number): void;
    destroy?(): void;
  }
}
