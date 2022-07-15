<template><div><p><RouterLink to="/api/">Api</RouterLink> / x-robot/validate</p>
<h1 id="module-x-robot-validate" tabindex="-1"><a class="header-anchor" href="#module-x-robot-validate" aria-hidden="true">#</a> Module: x-robot/validate</h1>
<p><strong><code v-pre>Description</code></strong></p>
<p>Validates the machine prior to its use.</p>
<h2 id="table-of-contents" tabindex="-1"><a class="header-anchor" href="#table-of-contents" aria-hidden="true">#</a> Table of contents</h2>
<h3 id="validation-functions" tabindex="-1"><a class="header-anchor" href="#validation-functions" aria-hidden="true">#</a> Validation Functions</h3>
<ul>
<li><RouterLink to="/api/modules/x_robot_validate.html#validate">validate</RouterLink></li>
</ul>
<h3 id="other-functions" tabindex="-1"><a class="header-anchor" href="#other-functions" aria-hidden="true">#</a> Other Functions</h3>
<ul>
<li><RouterLink to="/api/modules/x_robot_validate.html#ok">ok</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_validate.html#err">err</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_validate.html#combine">combine</RouterLink></li>
</ul>
<h3 id="type-aliases" tabindex="-1"><a class="header-anchor" href="#type-aliases" aria-hidden="true">#</a> Type Aliases</h3>
<ul>
<li><RouterLink to="/api/modules/x_robot_validate.html#result">Result</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_validate.html#results">Results</RouterLink></li>
</ul>
<h3 id="classes" tabindex="-1"><a class="header-anchor" href="#classes" aria-hidden="true">#</a> Classes</h3>
<ul>
<li><RouterLink to="/api/classes/x_robot_validate.Ok.html">Ok</RouterLink></li>
<li><RouterLink to="/api/classes/x_robot_validate.Err.html">Err</RouterLink></li>
</ul>
<h2 id="validation-functions-1" tabindex="-1"><a class="header-anchor" href="#validation-functions-1" aria-hidden="true">#</a> Validation Functions</h2>
<h3 id="validate" tabindex="-1"><a class="header-anchor" href="#validate" aria-hidden="true">#</a> validate</h3>
<p>▸ <strong>validate</strong>(<code v-pre>machine</code>): <code v-pre>void</code></p>
<p>This function validates a machine and all its nested and parallel machines if any.</p>
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
<td style="text-align:left"><code v-pre>machine</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.Machine.html"><code v-pre>Machine</code></RouterLink></td>
<td style="text-align:left">The machine to validate</td>
</tr>
</tbody>
</table>
<h4 id="returns" tabindex="-1"><a class="header-anchor" href="#returns" aria-hidden="true">#</a> Returns</h4>
<p><code v-pre>void</code></p>
<p>Void if the machine is valid, throws an error otherwise</p>
<hr>
<h2 id="other-functions-1" tabindex="-1"><a class="header-anchor" href="#other-functions-1" aria-hidden="true">#</a> Other Functions</h2>
<h3 id="ok" tabindex="-1"><a class="header-anchor" href="#ok" aria-hidden="true">#</a> ok</h3>
<p>▸ <strong>ok</strong>&lt;<code v-pre>T</code>&gt;(<code v-pre>value</code>): <RouterLink to="/api/classes/x_robot_validate.Ok.html"><code v-pre>Ok</code></RouterLink>&lt;<code v-pre>T</code>, <code v-pre>never</code>&gt;</p>
<h4 id="type-parameters" tabindex="-1"><a class="header-anchor" href="#type-parameters" aria-hidden="true">#</a> Type parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>T</code></td>
</tr>
</tbody>
</table>
<h4 id="parameters-1" tabindex="-1"><a class="header-anchor" href="#parameters-1" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>value</code></td>
<td style="text-align:left"><code v-pre>T</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-1" tabindex="-1"><a class="header-anchor" href="#returns-1" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/classes/x_robot_validate.Ok.html"><code v-pre>Ok</code></RouterLink>&lt;<code v-pre>T</code>, <code v-pre>never</code>&gt;</p>
<hr>
<h3 id="err" tabindex="-1"><a class="header-anchor" href="#err" aria-hidden="true">#</a> err</h3>
<p>▸ <strong>err</strong>&lt;<code v-pre>E</code>&gt;(<code v-pre>err</code>): <RouterLink to="/api/classes/x_robot_validate.Err.html"><code v-pre>Err</code></RouterLink>&lt;<code v-pre>never</code>, <code v-pre>E</code>&gt;</p>
<h4 id="type-parameters-1" tabindex="-1"><a class="header-anchor" href="#type-parameters-1" aria-hidden="true">#</a> Type parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>E</code></td>
</tr>
</tbody>
</table>
<h4 id="parameters-2" tabindex="-1"><a class="header-anchor" href="#parameters-2" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>err</code></td>
<td style="text-align:left"><code v-pre>E</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-2" tabindex="-1"><a class="header-anchor" href="#returns-2" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/classes/x_robot_validate.Err.html"><code v-pre>Err</code></RouterLink>&lt;<code v-pre>never</code>, <code v-pre>E</code>&gt;</p>
<hr>
<h3 id="combine" tabindex="-1"><a class="header-anchor" href="#combine" aria-hidden="true">#</a> combine</h3>
<p>▸ <strong>combine</strong>&lt;<code v-pre>T</code>, <code v-pre>E</code>&gt;(<code v-pre>results</code>): <RouterLink to="/api/modules/x_robot_validate.html#result"><code v-pre>Result</code></RouterLink>&lt;<code v-pre>T</code>, <code v-pre>E</code>&gt; | <RouterLink to="/api/modules/x_robot_validate.html#results"><code v-pre>Results</code></RouterLink>&lt;<code v-pre>T</code>, <code v-pre>E</code>&gt;</p>
<h4 id="type-parameters-2" tabindex="-1"><a class="header-anchor" href="#type-parameters-2" aria-hidden="true">#</a> Type parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>T</code></td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>E</code></td>
</tr>
</tbody>
</table>
<h4 id="parameters-3" tabindex="-1"><a class="header-anchor" href="#parameters-3" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>results</code></td>
<td style="text-align:left"><RouterLink to="/api/modules/x_robot_validate.html#results"><code v-pre>Results</code></RouterLink>&lt;<code v-pre>T</code>, <code v-pre>E</code>&gt;</td>
</tr>
</tbody>
</table>
<h4 id="returns-3" tabindex="-1"><a class="header-anchor" href="#returns-3" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/modules/x_robot_validate.html#result"><code v-pre>Result</code></RouterLink>&lt;<code v-pre>T</code>, <code v-pre>E</code>&gt; | <RouterLink to="/api/modules/x_robot_validate.html#results"><code v-pre>Results</code></RouterLink>&lt;<code v-pre>T</code>, <code v-pre>E</code>&gt;</p>
<h2 id="type-aliases-1" tabindex="-1"><a class="header-anchor" href="#type-aliases-1" aria-hidden="true">#</a> Type Aliases</h2>
<h3 id="result" tabindex="-1"><a class="header-anchor" href="#result" aria-hidden="true">#</a> Result</h3>
<p>Ƭ <strong>Result</strong>&lt;<code v-pre>T</code>, <code v-pre>E</code>&gt;: <RouterLink to="/api/classes/x_robot_validate.Ok.html"><code v-pre>Ok</code></RouterLink>&lt;<code v-pre>T</code>, <code v-pre>never</code>&gt; | <RouterLink to="/api/classes/x_robot_validate.Err.html"><code v-pre>Err</code></RouterLink>&lt;<code v-pre>never</code>, <code v-pre>E</code>&gt;</p>
<h4 id="type-parameters-3" tabindex="-1"><a class="header-anchor" href="#type-parameters-3" aria-hidden="true">#</a> Type parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>T</code></td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>E</code></td>
</tr>
</tbody>
</table>
<h4 id="defined-in" tabindex="-1"><a class="header-anchor" href="#defined-in" aria-hidden="true">#</a> Defined in</h4>
<p><a href="https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/validate/result.ts#L5" target="_blank" rel="noopener noreferrer">lib/validate/result.ts:5</a></p>
<hr>
<h3 id="results" tabindex="-1"><a class="header-anchor" href="#results" aria-hidden="true">#</a> Results</h3>
<p>Ƭ <strong>Results</strong>&lt;<code v-pre>T</code>, <code v-pre>E</code>&gt;: <RouterLink to="/api/modules/x_robot_validate.html#result"><code v-pre>Result</code></RouterLink>&lt;<code v-pre>T</code>, <code v-pre>E</code>&gt;[]</p>
<h4 id="type-parameters-4" tabindex="-1"><a class="header-anchor" href="#type-parameters-4" aria-hidden="true">#</a> Type parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>T</code></td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>E</code></td>
</tr>
</tbody>
</table>
<h4 id="defined-in-1" tabindex="-1"><a class="header-anchor" href="#defined-in-1" aria-hidden="true">#</a> Defined in</h4>
<p><a href="https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/validate/result.ts#L7" target="_blank" rel="noopener noreferrer">lib/validate/result.ts:7</a></p>
</div></template>
