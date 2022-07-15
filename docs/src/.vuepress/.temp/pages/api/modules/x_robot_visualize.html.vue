<template><div><p><RouterLink to="/api/">Api</RouterLink> / x-robot/visualize</p>
<h1 id="module-x-robot-visualize" tabindex="-1"><a class="header-anchor" href="#module-x-robot-visualize" aria-hidden="true">#</a> Module: x-robot/visualize</h1>
<p><strong><code v-pre>Description</code></strong></p>
<p>Generate a visual representation of a machine in plant uml format or get a png/svg image of the diagram.</p>
<h2 id="table-of-contents" tabindex="-1"><a class="header-anchor" href="#table-of-contents" aria-hidden="true">#</a> Table of contents</h2>
<h3 id="visualization-functions" tabindex="-1"><a class="header-anchor" href="#visualization-functions" aria-hidden="true">#</a> Visualization Functions</h3>
<ul>
<li><RouterLink to="/api/modules/x_robot_visualize.html#getplantumlcode">getPlantUmlCode</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_visualize.html#getplantumlcodefrommachine">getPlantUmlCodeFromMachine</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_visualize.html#createpngfromplantumlcode">createPngFromPlantUmlCode</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_visualize.html#createsvgfromplantumlcode">createSvgFromPlantUmlCode</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_visualize.html#createpngfrommachine">createPngFromMachine</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_visualize.html#createsvgfrommachine">createSvgFromMachine</RouterLink></li>
</ul>
<h3 id="interfaces" tabindex="-1"><a class="header-anchor" href="#interfaces" aria-hidden="true">#</a> Interfaces</h3>
<ul>
<li><RouterLink to="/api/interfaces/x_robot_visualize.SerializedCollectionWithGuards.html">SerializedCollectionWithGuards</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot_visualize.options.html">options</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot_visualize.imageFromPlantUmlCodeOptions.html">imageFromPlantUmlCodeOptions</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot_visualize.imageFromMachineOptions.html">imageFromMachineOptions</RouterLink></li>
</ul>
<h3 id="variables" tabindex="-1"><a class="header-anchor" href="#variables" aria-hidden="true">#</a> Variables</h3>
<ul>
<li><RouterLink to="/api/modules/x_robot_visualize.html#visualization_level">VISUALIZATION_LEVEL</RouterLink></li>
</ul>
<h2 id="visualization-functions-1" tabindex="-1"><a class="header-anchor" href="#visualization-functions-1" aria-hidden="true">#</a> Visualization Functions</h2>
<h3 id="getplantumlcode" tabindex="-1"><a class="header-anchor" href="#getplantumlcode" aria-hidden="true">#</a> getPlantUmlCode</h3>
<p>▸ <strong>getPlantUmlCode</strong>(<code v-pre>serializedMachine</code>, <code v-pre>optionsOrLevel?</code>): <code v-pre>string</code></p>
<p>This function will get a serialized machine and will return plantuml code representation of it.</p>
<h4 id="parameters" tabindex="-1"><a class="header-anchor" href="#parameters" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
<th style="text-align:left">Default value</th>
<th style="text-align:left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>serializedMachine</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot_serialize.SerializedMachine.html"><code v-pre>SerializedMachine</code></RouterLink></td>
<td style="text-align:left"><code v-pre>undefined</code></td>
<td style="text-align:left">The serialized machine to be visualized.</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>optionsOrLevel</code></td>
<td style="text-align:left"><code v-pre>string</code> | <RouterLink to="/api/interfaces/x_robot_visualize.options.html"><code v-pre>options</code></RouterLink></td>
<td style="text-align:left"><code v-pre>VISUALIZATION_LEVEL.LOW</code></td>
<td style="text-align:left">-</td>
</tr>
</tbody>
</table>
<h4 id="returns" tabindex="-1"><a class="header-anchor" href="#returns" aria-hidden="true">#</a> Returns</h4>
<p><code v-pre>string</code></p>
<p>The plantuml code for the visualization.</p>
<hr>
<h3 id="getplantumlcodefrommachine" tabindex="-1"><a class="header-anchor" href="#getplantumlcodefrommachine" aria-hidden="true">#</a> getPlantUmlCodeFromMachine</h3>
<p>▸ <strong>getPlantUmlCodeFromMachine</strong>(<code v-pre>machine</code>, <code v-pre>optionsOrLevel?</code>): <code v-pre>string</code></p>
<p>This function will get a machine and will return a plant uml code representation of it.</p>
<h4 id="parameters-1" tabindex="-1"><a class="header-anchor" href="#parameters-1" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
<th style="text-align:left">Default value</th>
<th style="text-align:left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>machine</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.Machine.html"><code v-pre>Machine</code></RouterLink></td>
<td style="text-align:left"><code v-pre>undefined</code></td>
<td style="text-align:left">The machine to get the plant uml code from</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>optionsOrLevel</code></td>
<td style="text-align:left"><code v-pre>string</code> | <RouterLink to="/api/interfaces/x_robot_visualize.options.html"><code v-pre>options</code></RouterLink></td>
<td style="text-align:left"><code v-pre>VISUALIZATION_LEVEL.LOW</code></td>
<td style="text-align:left">The level of the machine to get the plant uml code from or options for the image</td>
</tr>
</tbody>
</table>
<h4 id="returns-1" tabindex="-1"><a class="header-anchor" href="#returns-1" aria-hidden="true">#</a> Returns</h4>
<p><code v-pre>string</code></p>
<p>The plant uml code</p>
<hr>
<h3 id="createpngfromplantumlcode" tabindex="-1"><a class="header-anchor" href="#createpngfromplantumlcode" aria-hidden="true">#</a> createPngFromPlantUmlCode</h3>
<p>▸ <strong>createPngFromPlantUmlCode</strong>(<code v-pre>plantUmlCode</code>, <code v-pre>options?</code>): <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise" target="_blank" rel="noopener noreferrer"><code v-pre>Promise</code></a>&lt;<code v-pre>string</code>&gt;</p>
<p>Create a png file from a plant uml code</p>
<h4 id="parameters-2" tabindex="-1"><a class="header-anchor" href="#parameters-2" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
<th style="text-align:left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>plantUmlCode</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
<td style="text-align:left">The plant uml code</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>options</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot_visualize.imageFromMachineOptions.html"><code v-pre>imageFromMachineOptions</code></RouterLink></td>
<td style="text-align:left">Options for the image</td>
</tr>
</tbody>
</table>
<h4 id="returns-2" tabindex="-1"><a class="header-anchor" href="#returns-2" aria-hidden="true">#</a> Returns</h4>
<p><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise" target="_blank" rel="noopener noreferrer"><code v-pre>Promise</code></a>&lt;<code v-pre>string</code>&gt;</p>
<p>The path to the png file</p>
<hr>
<h3 id="createsvgfromplantumlcode" tabindex="-1"><a class="header-anchor" href="#createsvgfromplantumlcode" aria-hidden="true">#</a> createSvgFromPlantUmlCode</h3>
<p>▸ <strong>createSvgFromPlantUmlCode</strong>(<code v-pre>plantUmlCode</code>, <code v-pre>options?</code>): <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise" target="_blank" rel="noopener noreferrer"><code v-pre>Promise</code></a>&lt;<code v-pre>string</code>&gt;</p>
<p>Create a svg file from a plant uml code</p>
<h4 id="parameters-3" tabindex="-1"><a class="header-anchor" href="#parameters-3" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
<th style="text-align:left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>plantUmlCode</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
<td style="text-align:left">The plant uml code</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>options</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot_visualize.imageFromMachineOptions.html"><code v-pre>imageFromMachineOptions</code></RouterLink></td>
<td style="text-align:left">Options for the image</td>
</tr>
</tbody>
</table>
<h4 id="returns-3" tabindex="-1"><a class="header-anchor" href="#returns-3" aria-hidden="true">#</a> Returns</h4>
<p><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise" target="_blank" rel="noopener noreferrer"><code v-pre>Promise</code></a>&lt;<code v-pre>string</code>&gt;</p>
<p>The path to the svg file</p>
<hr>
<h3 id="createpngfrommachine" tabindex="-1"><a class="header-anchor" href="#createpngfrommachine" aria-hidden="true">#</a> createPngFromMachine</h3>
<p>▸ <strong>createPngFromMachine</strong>(<code v-pre>machine</code>, <code v-pre>optionsOrLevel?</code>): <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise" target="_blank" rel="noopener noreferrer"><code v-pre>Promise</code></a>&lt;<code v-pre>string</code>&gt;</p>
<p>Create a png file from a machine</p>
<h4 id="parameters-4" tabindex="-1"><a class="header-anchor" href="#parameters-4" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
<th style="text-align:left">Default value</th>
<th style="text-align:left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>machine</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.Machine.html"><code v-pre>Machine</code></RouterLink></td>
<td style="text-align:left"><code v-pre>undefined</code></td>
<td style="text-align:left">The machine to get the plant uml code from</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>optionsOrLevel</code></td>
<td style="text-align:left"><code v-pre>string</code> | <RouterLink to="/api/interfaces/x_robot_visualize.imageFromMachineOptions.html"><code v-pre>imageFromMachineOptions</code></RouterLink></td>
<td style="text-align:left"><code v-pre>VISUALIZATION_LEVEL.LOW</code></td>
<td style="text-align:left">The level of the machine to get the plant uml code from or options for the image</td>
</tr>
</tbody>
</table>
<h4 id="returns-4" tabindex="-1"><a class="header-anchor" href="#returns-4" aria-hidden="true">#</a> Returns</h4>
<p><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise" target="_blank" rel="noopener noreferrer"><code v-pre>Promise</code></a>&lt;<code v-pre>string</code>&gt;</p>
<p>The path to the png file</p>
<hr>
<h3 id="createsvgfrommachine" tabindex="-1"><a class="header-anchor" href="#createsvgfrommachine" aria-hidden="true">#</a> createSvgFromMachine</h3>
<p>▸ <strong>createSvgFromMachine</strong>(<code v-pre>machine</code>, <code v-pre>optionsOrLevel?</code>): <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise" target="_blank" rel="noopener noreferrer"><code v-pre>Promise</code></a>&lt;<code v-pre>string</code>&gt;</p>
<p>Create a svg file from a machine</p>
<h4 id="parameters-5" tabindex="-1"><a class="header-anchor" href="#parameters-5" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
<th style="text-align:left">Default value</th>
<th style="text-align:left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>machine</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.Machine.html"><code v-pre>Machine</code></RouterLink></td>
<td style="text-align:left"><code v-pre>undefined</code></td>
<td style="text-align:left">The machine to get the plant uml code from</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>optionsOrLevel</code></td>
<td style="text-align:left"><code v-pre>string</code> | <RouterLink to="/api/interfaces/x_robot_visualize.imageFromMachineOptions.html"><code v-pre>imageFromMachineOptions</code></RouterLink></td>
<td style="text-align:left"><code v-pre>VISUALIZATION_LEVEL.LOW</code></td>
<td style="text-align:left">The level of the machine to get the plant uml code from or options for the image</td>
</tr>
</tbody>
</table>
<h4 id="returns-5" tabindex="-1"><a class="header-anchor" href="#returns-5" aria-hidden="true">#</a> Returns</h4>
<p><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise" target="_blank" rel="noopener noreferrer"><code v-pre>Promise</code></a>&lt;<code v-pre>string</code>&gt;</p>
<p>The path to the svg file</p>
<h2 id="variables-1" tabindex="-1"><a class="header-anchor" href="#variables-1" aria-hidden="true">#</a> Variables</h2>
<h3 id="visualization-level" tabindex="-1"><a class="header-anchor" href="#visualization-level" aria-hidden="true">#</a> VISUALIZATION_LEVEL</h3>
<p>• <code v-pre>Const</code> <strong>VISUALIZATION_LEVEL</strong>: <code v-pre>Object</code></p>
<h4 id="type-declaration" tabindex="-1"><a class="header-anchor" href="#type-declaration" aria-hidden="true">#</a> Type declaration</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>LOW</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>HIGH</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
</tr>
</tbody>
</table>
<h4 id="defined-in" tabindex="-1"><a class="header-anchor" href="#defined-in" aria-hidden="true">#</a> Defined in</h4>
<p><a href="https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/visualize/index.ts#L39" target="_blank" rel="noopener noreferrer">lib/visualize/index.ts:39</a></p>
</div></template>
