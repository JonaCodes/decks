import { observer } from 'mobx-react-lite'
import { useStore } from '../../stores/StoreContext'
import TopBar from './TopBar'
import LeftPanel from './LeftPanel'
import Canvas from './Canvas'
import RightPanel from './RightPanel'

const EditorLayout = observer(() => {
  const store = useStore()
  const isTemplateMode = store.editor.mode === 'template'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {!isTemplateMode && <LeftPanel />}
        <Canvas />
        <RightPanel />
      </div>
    </div>
  )
})

export default EditorLayout
