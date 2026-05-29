declare module 'translate-google' {
  function translate(
    text: string,
    options?: { from?: string; to?: string }
  ): Promise<string>
  export = translate
}
