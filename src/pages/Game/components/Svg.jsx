import { forwardRef } from 'react'

export const Svg = forwardRef(function Svg({ size = [100, 100], style = {}, children }, ref) {
	if (!Array.isArray(size))
		size = [size, size]
	return <svg ref={ref} viewBox={`0 0 ${size[0]} ${size[1]}`} style={{ background: '#000', display: 'block', margin: '1.5rem auto', maxWidth: '400px', userSelect: 'none', ...style }}>
		{children}
	</svg>
})
