import { Component, Input } from '@angular/core';
import * as d3 from 'd3';
import { SharedStateService } from '../shared-state.service';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss']
})
export class HistogramComponent {
  @Input() data!: any[];
  
  constructor(private sharedStateService: SharedStateService) {}

  ngOnInit(){}

  updateHistogram() {
    const data = this.data;
    const container = document.getElementById('histogramContainer');
    if (!container) {
      console.error(`Container not found`);
      return;
    }
  
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 20, right: 30, bottom: 50, left: 40 };
  
    d3.select('#histogramContainer').selectAll('*').remove();
  
    const svg = d3.select('#histogramContainer')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
  
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
  
    const x = d3.scaleBand()
      .domain(data.map(d => d.z.toFixed(2)).sort((a, b) => parseFloat(a) - parseFloat(b)))
      .range([0, chartWidth])
      .padding(0.1);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)!])
      .range([chartHeight, 0]);
  
    svg.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(x).tickFormat(d => d.toString()));
    
    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('x', chartWidth)
      .attr('y', chartHeight + margin.bottom - 15)
      .attr('font-size', '10px')
      .text('Depth (cm)');
    
    svg.append('g')
      .call(d3.axisLeft(y));
    
      svg.append('text')
      .attr('text-anchor', 'end')
      .attr('x', 7)
      .attr('y', -10)
      .attr('font-size', '10px')
      .text('Frequency');
  
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.z.toFixed(2))!)
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => chartHeight - y(d.value))
      .attr('fill', 'steelblue');
  }
}
