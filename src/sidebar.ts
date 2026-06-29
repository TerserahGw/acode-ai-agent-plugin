import Icon from './icons/icon.svg'
import { renderPanel } from './panel'
import { PLUGIN_ID } from './configs/constants'

const sideBarApps = acode.require('sidebarApps')
let scrollBottom: undefined | (() => void) = undefined

const removeIcon = () => {
	sideBarApps.remove(PLUGIN_ID)
}

const addIcon = () => {
	acode.addIcon('ai-agent-icon', Icon)

	// Remove first in case plugin is reloading/updating
	removeIcon()

	sideBarApps.add(
	'ai-agent-icon',
	PLUGIN_ID,
	'Conduit Coding Agent',
	(container: HTMLElement) => {
		scrollBottom = renderPanel(container)
	},
	false,
	() => {
		if (scrollBottom) scrollBottom()
	}
)
}

export { addIcon, removeIcon }
