import * as api from './api'
import * as operationLog from './operation-log'
import * as roles from './roles'
import * as users from './users'

export const system = {
  ...api,
  ...roles,
  ...users,
  ...operationLog,
}
