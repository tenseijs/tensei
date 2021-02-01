---
to: <%= h.changeCase.param(name) %>/server/plugin.ts
---

import Path from 'path'
import { plugin } from '@tensei/common'

class <%= h.changeCase.pascal(name) %> {
    plugin() {
        return plugin('<%= name %>').boot(({ script, style }) => {
            script(
                '<%= h.changeCase.param(name) %>.js',
                Path.resolve(__dirname, '..', 'build/client/app.js')
            )
            style(
                '<%= h.changeCase.param(name) %>.css',
                Path.resolve(__dirname, '..', 'build/client/app.css')
            )
        })
    }
}

const <%= h.changeCase.camel(name) %> = () => new <%= h.changeCase.pascal(name) %>()

export default <%= h.changeCase.camel(name) %>
