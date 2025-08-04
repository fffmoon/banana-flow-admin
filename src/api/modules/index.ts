import * as captcha from './captcha'
import * as example from './example'
import * as imageManagement from './image-management'
import * as system from './system'
import * as user from './user'

export const API = {
  ...captcha,
  ...user,
  ...system,
  ...imageManagement,
  ...example,
}
