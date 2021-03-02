From: `import \{ ([a-zA-Z ]*) \} from '@material-ui/core'`

To: `
import $1 from '@material-ui/core/$1';
import $2 from '@material-ui/core/$2';
`


import \{ ([a-zA-Z ]*) \} from '@material-ui/core'