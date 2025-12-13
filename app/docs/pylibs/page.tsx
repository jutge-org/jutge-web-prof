'use client'

import Page from '../../../components/layouts/court/Page'
import Markdown from '../../../components/wrappers/Markdown'

export default function DocsPyLibsPage() {
    return (
        <Page
            pageContext={{
                title: 'Docs',
                menu: 'user',
                current: 'docs',
                subTitle: 'PyLibs',
                subMenu: 'up',
            }}
        >
            <DocsPyLibsView />
        </Page>
    )
}

function DocsPyLibsView() {
    return <Markdown markdown={md} />
}

// TODO: to do this better.

const md = `
## Python libraries

All standard libraries are available for Python.

Moreover, certain problems in Python may allow the usage of some well known non standard libaries, such as \`numpy\` or \`networkx\`. These libaries are not available unless specified in the problem description (see Information frame under the problem statement).

The following libraries are currently available:

- \`beautifulsoup4\`
- \`biopython\`
- \`matplotlib\`
- \`more-itertools\`
- \`networkx\`
- \`numpy\`
- \`optilog\`
- \`pandas\`
- \`scipy\`
- \`simpy\`
`
