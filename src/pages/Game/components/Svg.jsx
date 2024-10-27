export function Svg({ size = [100, 100], style = {}, children }) {
	if (!Array.isArray(size))
		size = [size, size]
	return <svg viewBox={`0 0 ${size[0]} ${size[1]}`} style={{ background: '#000', display: 'block', margin: '1.5rem auto', maxWidth: '400px', ...style }}>
		{children}
	</svg>
}
