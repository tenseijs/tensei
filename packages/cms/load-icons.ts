import { icon as EuiGear } from '@tensei/eui/lib/components/icon/assets/gear'
import { appendIconComponentCache } from '@tensei/eui/lib/components/icon/icon'
import { icon as EuiEyeIcon } from '@tensei/eui/lib/components/icon/assets/eye'
import { icon as EuiLockIcon } from '@tensei/eui/lib/components/icon/assets/lock'
import { icon as EuiHelpIcon } from '@tensei/eui/lib/components/icon/assets/help'
import { icon as EuiAppLensIcon } from '@tensei/eui/lib/components/icon/assets/app_lens'
import { icon as EuiArrowLeftIcon } from '@tensei/eui/lib/components/icon/assets/arrow_left'
import { icon as EuiEyeClosedIcon } from '@tensei/eui/lib/components/icon/assets/eye_closed'

appendIconComponentCache({
  lensApp: EuiAppLensIcon,
  arrowLeft: EuiArrowLeftIcon,
  lock: EuiLockIcon,
  eye: EuiEyeIcon,
  eyeClosed: EuiEyeClosedIcon,
  gear: EuiGear,
  help: EuiHelpIcon
})
