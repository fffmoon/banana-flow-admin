import * as account from './account'
import * as auth from './auth'
import * as captcha from './captcha'
import * as common from './common'
import * as example from './example'
import * as imageManagement from './image-management'
import * as system from './system'

export const API = {
  ...captcha,
  ...auth,
  ...system,
  ...imageManagement,
  ...example,
  ...common,
  ...account,
}
