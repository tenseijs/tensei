export {}

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeOdd(): R
            toContainObject(object: {}): R
        }
    }
}
