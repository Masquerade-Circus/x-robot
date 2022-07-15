<template><div><p><RouterLink to="/api/">Api</RouterLink> / x-robot/generate</p>
<h1 id="module-x-robot-generate" tabindex="-1"><a class="header-anchor" href="#module-x-robot-generate" aria-hidden="true">#</a> Module: x-robot/generate</h1>
<p><strong><code v-pre>Description</code></strong></p>
<p>Generate code from a serialized machine</p>
<h2 id="table-of-contents" tabindex="-1"><a class="header-anchor" href="#table-of-contents" aria-hidden="true">#</a> Table of contents</h2>
<h3 id="functions" tabindex="-1"><a class="header-anchor" href="#functions" aria-hidden="true">#</a> Functions</h3>
<ul>
<li><RouterLink to="/api/modules/x_robot_generate.html#generatefromserializedmachine">generateFromSerializedMachine</RouterLink></li>
</ul>
<h3 id="enumerations" tabindex="-1"><a class="header-anchor" href="#enumerations" aria-hidden="true">#</a> Enumerations</h3>
<ul>
<li><RouterLink to="/api/enums/x_robot_generate.Format.html">Format</RouterLink></li>
</ul>
<h2 id="functions-1" tabindex="-1"><a class="header-anchor" href="#functions-1" aria-hidden="true">#</a> Functions</h2>
<h3 id="generatefromserializedmachine" tabindex="-1"><a class="header-anchor" href="#generatefromserializedmachine" aria-hidden="true">#</a> generateFromSerializedMachine</h3>
<p>▸ <strong>generateFromSerializedMachine</strong>(<code v-pre>serializedMachine</code>, <code v-pre>format</code>): <code v-pre>string</code></p>
<h4 id="parameters" tabindex="-1"><a class="header-anchor" href="#parameters" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left"><code v-pre>serializedMachine</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot_serialize.SerializedMachine.html"><code v-pre>SerializedMachine</code></RouterLink></td>
<td style="text-align:left">The machine to generate code for</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>format</code></td>
<td style="text-align:left"><RouterLink to="/api/enums/x_robot_generate.Format.html"><code v-pre>Format</code></RouterLink></td>
<td style="text-align:left">The format to generate code for, either esm or cjs</td>
</tr>
</tbody>
</table>
<h4 id="returns" tabindex="-1"><a class="header-anchor" href="#returns" aria-hidden="true">#</a> Returns</h4>
<p><code v-pre>string</code></p>
<p>The generated code as a string</p>
</div></template>
