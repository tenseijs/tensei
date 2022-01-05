import { FileContent } from '../types'

export function readMe(): FileContent {
  return {
    content: `<div align="center">
  <br />
  <br />
  <img src="https://res.cloudinary.com/bahdcoder/image/upload/v1604236130/Asset_1_4x_fhcfyg.png" width="450px">
</div>

<br />

<br />

<div align="center">
  <h3>
    <strong>
    The fastest and easiest way to build powerful and secure APIs
    </strong>
  </h3>
  <p>Open source Node.js Headless CMS 🚀. </p>
</div>

<br />

<div align="center">
  <h3>
    <a href="https://tenseijs.com">
      Website
    </a>
    <span> | </span>
    <a href="https://tenseijs.com/docs">
      Guides
    </a>
    <span> | </span>
    <a href="CONTRIBUTING.md">
      Contributing
    </a>
  </h3>
</div>

<div align="center">
  <sub>Built with ❤︎ by <a href="https://github.com/bahdcoder">Kati Frantz</a>
</div>`,
    location: 'readme.md',
    sides: ['frontend', 'backend']
  }
}
