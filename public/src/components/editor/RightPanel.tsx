import { observer } from 'mobx-react-lite'
import { PropertyPanel } from './properties/PropertyPanel'

const RightPanel = observer(() => {
  return (
    <div
      style={{
        width: 280,
        borderLeft: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      <PropertyPanel />
    </div>
  )
})

export default RightPanel
