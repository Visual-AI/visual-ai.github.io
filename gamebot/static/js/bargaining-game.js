// // bargaining.js
// const width = 600;
// const height = 300;
// const margin = { top: 20, right: 20, bottom: 30, left: 40 };
//
// function createBargainingVisualization(containerId) {
//     const svg = d3.select(`#${containerId}`)
//         .append('svg')
//         .attr('width', width)
//         .attr('height', height);
//
//     // Sample game data
//     const gameData = {
//         cycles: [
//             {
//                 cycleNum: 3,
//                 pool: [2, 4, 5],
//                 p1Values: [3, 6, 0],
//                 p2Values: [6, 2, 2],
//                 rounds: [
//                     { round: 1, p1: [1, 4, 0], p2: [1, 0, 5] },
//                     { round: 2, p1: [1, 3, 1], p2: [1, 1, 4] },
//                     { round: 3, p1: [2, 3, 0], p2: [0, 1, 5] },
//                     { round: 4, p1: [0, 2, 2], p2: [2, 2, 3] },
//                     { round: 5, p1: [1, 3, 2], p2: [1, 1, 3] },
//                     { round: 6, p1: [0, 3, 2], p2: [2, 1, 3] },
//                     { round: 7, p1: [0, 4, 1], p2: [2, 0, 4] }
//                 ],
//                 agreement: true,
//                 rewards: { p1: 24, p2: 20 }
//             },
//             {
//                 cycleNum: 4,
//                 pool: [3, 2, 5],
//                 p1Values: [4, 4, 2],
//                 p2Values: [3, 8, 1],
//                 rounds: [
//                     { round: 1, p1: [3, 1, 2], p2: [0, 1, 3] },
//                     { round: 2, p1: [2, 0, 3], p2: [1, 2, 2] },
//                     { round: 3, p1: [2, 1, 3], p2: [1, 1, 2] },
//                     { round: 4, p1: [2, 0, 4], p2: [1, 2, 1] },
//                     { round: 5, p1: [2, 0, 4], p2: [1, 2, 1] },
//                     { round: 6, p1: [1, 1, 3], p2: [2, 1, 2] },
//                     { round: 7, p1: [2, 1, 3], p2: [1, 1, 2] },
//                     { round: 8, p1: [1, 0, 4], p2: [2, 2, 1] },
//                     { round: 9, p1: [2, 0, 4], p2: [1, 2, 1] }
//                 ],
//                 agreement: false,
//                 rewards: { p1: 0, p2: 0 }
//             }
//         ],
//         currentCycle: 0
//     };
//
//     let currentCycle = gameData.cycles[gameData.currentCycle];
//     let currentRound = 0;
//
//     function drawGame() {
//         svg.selectAll('*').remove();
//
//         // Draw title
//         svg.append('text')
//             .attr('x', width / 2)
//             .attr('y', margin.top)
//             .attr('text-anchor', 'middle')
//             .attr('class', 'title')
//             .text(`Cycle ${currentCycle.cycleNum} - Round ${currentRound + 1}`);
//
//         // Draw pool items
//         const poolGroup = svg.append('g')
//             .attr('transform', `translate(${width/2}, ${margin.top + 30})`);
//
//         poolGroup.selectAll('rect')
//             .data(currentCycle.pool)
//             .enter()
//             .append('rect')
//             .attr('x', (d, i) => i * 60 - 90)
//             .attr('y', 0)
//             .attr('width', 50)
//             .attr('height', 30)
//             .attr('class', 'pool-item');
//
//         poolGroup.selectAll('text')
//             .data(currentCycle.pool)
//             .enter()
//             .append('text')
//             .attr('x', (d, i) => i * 60 - 65)
//             .attr('y', 20)
//             .attr('text-anchor', 'middle')
//             .text(d => d);
//
//         // Draw player proposals if we have a current round
//         if (currentRound < currentCycle.rounds.length) {
//             const round = currentCycle.rounds[currentRound];
//
//             // Player 1 proposal
//             const p1Group = svg.append('g')
//                 .attr('transform', `translate(${width/4}, ${height/2})`);
//
//             p1Group.selectAll('rect')
//                 .data(round.p1)
//                 .enter()
//                 .append('rect')
//                 .attr('x', (d, i) => i * 60 - 90)
//                 .attr('y', 0)
//                 .attr('width', 50)
//                 .attr('height', 30)
//                 .attr('class', 'p1-proposal');
//
//             p1Group.selectAll('text')
//                 .data(round.p1)
//                 .enter()
//                 .append('text')
//                 .attr('x', (d, i) => i * 60 - 65)
//                 .attr('y', 20)
//                 .attr('text-anchor', 'middle')
//                 .text(d => d);
//
//             // Player 2 proposal
//             const p2Group = svg.append('g')
//                 .attr('transform', `translate(${3 * width/4}, ${height/2})`);
//
//             p2Group.selectAll('rect')
//                 .data(round.p2)
//                 .enter()
//                 .append('rect')
//                 .attr('x', (d, i) => i * 60 - 90)
//                 .attr('y', 0)
//                 .attr('width', 50)
//                 .attr('height', 30)
//                 .attr('class', 'p2-proposal');
//
//             p2Group.selectAll('text')
//                 .data(round.p2)
//                 .enter()
//                 .append('text')
//                 .attr('x', (d, i) => i * 60 - 65)
//                 .attr('y', 20)
//                 .attr('text-anchor', 'middle')
//                 .text(d => d);
//
//             // Labels
//             svg.append('text')
//                 .attr('x', width/4)
//                 .attr('y', height/2 - 20)
//                 .attr('text-anchor', 'middle')
//                 .attr('class', 'player-label')
//                 .text('Player 1 Proposal');
//
//             svg.append('text')
//                 .attr('x', 3 * width/4)
//                 .attr('y', height/2 - 20)
//                 .attr('text-anchor', 'middle')
//                 .attr('class', 'player-label')
//                 .text('Player 2 Proposal');
//         }
//
//         // Draw controls
//         const controls = svg.append('g')
//             .attr('transform', `translate(${width/2}, ${height - margin.bottom})`);
//
//         controls.append('rect')
//             .attr('x', -100)
//             .attr('y', -30)
//             .attr('width', 60)
//             .attr('height', 25)
//             .attr('class', 'control-button')
//             .on('click', prevRound);
//
//         controls.append('rect')
//             .attr('x', 40)
//             .attr('y', -30)
//             .attr('width', 60)
//             .attr('height', 25)
//             .attr('class', 'control-button')
//             .on('click', nextRound);
//
//         controls.append('text')
//             .attr('x', -70)
//             .attr('y', -15)
//             .attr('text-anchor', 'middle')
//             .text('Previous');
//
//         controls.append('text')
//             .attr('x', 70)
//             .attr('y', -15)
//             .attr('text-anchor', 'middle')
//             .text('Next');
//     }
//
//     function nextRound() {
//         if (currentRound < currentCycle.rounds.length - 1) {
//             currentRound++;
//             drawGame();
//         } else if (gameData.currentCycle < gameData.cycles.length - 1) {
//             gameData.currentCycle++;
//             currentCycle = gameData.cycles[gameData.currentCycle];
//             currentRound = 0;
//             drawGame();
//         }
//     }
//
//     function prevRound() {
//         if (currentRound > 0) {
//             currentRound--;
//             drawGame();
//         } else if (gameData.currentCycle > 0) {
//             gameData.currentCycle--;
//             currentCycle = gameData.cycles[gameData.currentCycle];
//             currentRound = currentCycle.rounds.length - 1;
//             drawGame();
//         }
//     }
//
//     drawGame();
// }
//
// // Initialize the visualization when the page loads
// document.addEventListener('DOMContentLoaded', () => {
//     createBargainingVisualization('bargaining-game');
// });