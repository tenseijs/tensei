export function getResource(slug: string) {
  return window.Tensei.state.resources.find(
    resource => resource?.slug === slug
  )!
}
