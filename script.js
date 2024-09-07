
// Constants
const DATA_URL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json';
const MARGIN = { top: 10, right: 10, bottom: 50, left: 10 };
const LEGEND_HEIGHT = 100;

// Fetch data and create the treemap
fetch(DATA_URL)
    .then(response => response.json())
    .then(data => createTreemap(data))
    .catch(error => {
        console.error('Error fetching data:', error);
        alert('Failed to load data. Please try again later.');
    });

function createTreemap(data) {
    const container = d3.select('#treemap-container');
    const width = container.node().offsetWidth - MARGIN.left - MARGIN.right;
    const height = width * 0.6;

    const svg = container.append('svg')
        .attr('width', width + MARGIN.left + MARGIN.right)
        .attr('height', height + MARGIN.top + MARGIN.bottom + LEGEND_HEIGHT)
        .append('g')
        .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const tooltip = d3.select('#tooltip');

    // Create the treemap layout
    const root = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    const treemap = d3.treemap()
        .size([width, height])
        .padding(2);

    treemap(root);

    // Define color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Draw the tiles
    const tiles = svg.selectAll('g')
        .data(root.leaves())
        .enter().append('g')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

    tiles.append('rect')
        .attr('class', 'tile')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('data-name', d => d.data.name)
        .attr('data-category', d => d.data.category)
        .attr('data-value', d => d.data.value)
        .attr('fill', d => color(d.data.category))
        .on('mouseover', (event, d) => {
            tooltip.style('visibility', 'visible')
                .attr('data-value', d.data.value)
                .html(`
                    <strong>${d.data.name}</strong><br>
                    Platform: ${d.data.category}<br>
                    Sales: ${d.data.value.toLocaleString()} million
                `);
        })
        .on('mousemove', (event) => {
            tooltip.style('top', (event.pageY + 10) + 'px')
                .style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', () => {
            tooltip.style('visibility', 'hidden');
        });

    // Add text to tiles with responsive wrapping
    tiles.append('text')
        .attr('x', 4)
        .attr('y', 14)
        .style('font-size', d => Math.min(12, (d.x1 - d.x0) / 5))
        .attr('fill', d => (d3.hsl(color(d.data.category)).l > 0.5 ? 'black' : 'white'))
        .selectAll('tspan')
        .data(d => {
            const words = d.data.name.split(/\s+/);
            let line = [];
            let lines = [];
            for (let i = 0; i < words.length; i++) {
                if ((line.join(' ') + ' ' + words[i]).length < (d.x1 - d.x0) / 6) {
                    line.push(words[i]);
                } else {
                    lines.push(line.join(' '));
                    line = [words[i]];
                }
            }
            lines.push(line.join(' '));
            return lines;
        })
        .enter().append('tspan')
        .attr('x', 4)
        .attr('y', (d, i) => 14 + i * 12)
        .text(d => d);

    // Create the legend
    const categories = Array.from(new Set(root.leaves().map(d => d.data.category)));

    const legend = d3.select('#legend')
        .append('svg')
        .attr('width', width)
        .attr('height', LEGEND_HEIGHT);

    const legendItems = legend.selectAll('.legend-item')
        .data(categories)
        .enter().append('g')
        .attr('transform', (d, i) => `translate(${i * 100}, 20)`); // Adjust positioning

    // Add rects with class 'legend-item'
    legendItems.append('rect')
        .attr('class', 'legend-item')
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', d => color(d))
        .attr('x', 0)
        .attr('y', 0);

    // Add labels
    legendItems.append('text')
        .attr('x', 25)
        .attr('y', 15)
        .attr('fill', 'black')
        .style('font-size', '14px')
        .text(d => d);

    // Make legend responsive
    window.addEventListener('resize', () => {
        const newWidth = container.node().offsetWidth - MARGIN.left - MARGIN.right;
        const newHeight = newWidth * 0.6;

        svg.attr('width', newWidth + MARGIN.left + MARGIN.right)
            .attr('height', newHeight + MARGIN.top + MARGIN.bottom + LEGEND_HEIGHT);

        treemap.size([newWidth, newHeight]);
        treemap(root);

        svg.selectAll('g')
            .attr('transform', d => `translate(${d.x0},${d.y0})`)
            .select('rect')
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0);

        svg.selectAll('text')
            .attr('x', 4)
            .attr('y', 14)
            .style('font-size', d => Math.min(12, (d.x1 - d.x0) / 5));
    });
}
