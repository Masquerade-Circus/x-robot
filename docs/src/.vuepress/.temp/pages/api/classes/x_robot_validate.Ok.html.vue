<template><div><p><RouterLink to="/api/">Api</RouterLink> / <RouterLink to="/api/modules/x_robot_validate.html">x-robot/validate</RouterLink> / Ok</p>
<h1 id="class-ok-t-e" tabindex="-1"><a class="header-anchor" href="#class-ok-t-e" aria-hidden="true">#</a> Class: Ok&lt;T, E&gt;</h1>
<p><RouterLink to="/api/modules/x_robot_validate.html">x-robot/validate</RouterLink>.Ok</p>
<h2 id="type-parameters" tabindex="-1"><a class="header-anchor" href="#type-parameters" aria-hidden="true">#</a> Type parameters</h2>
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
<h2 id="table-of-contents" tabindex="-1"><a class="header-anchor" href="#table-of-contents" aria-hidden="true">#</a> Table of contents</h2>
<h3 id="constructors" tabindex="-1"><a class="header-anchor" href="#constructors" aria-hidden="true">#</a> Constructors</h3>
<ul>
<li><RouterLink to="/api/classes/x_robot_validate.Ok.html#constructor">constructor</RouterLink></li>
</ul>
<h3 id="properties" tabindex="-1"><a class="header-anchor" href="#properties" aria-hidden="true">#</a> Properties</h3>
<ul>
<li><RouterLink to="/api/classes/x_robot_validate.Ok.html#value">value</RouterLink></li>
</ul>
<h3 id="methods" tabindex="-1"><a class="header-anchor" href="#methods" aria-hidden="true">#</a> Methods</h3>
<ul>
<li><RouterLink to="/api/classes/x_robot_validate.Ok.html#isok">isOk</RouterLink></li>
<li><RouterLink to="/api/classes/x_robot_validate.Ok.html#iserr">isErr</RouterLink></li>
<li><RouterLink to="/api/classes/x_robot_validate.Ok.html#unwrap">unwrap</RouterLink></li>
<li><RouterLink to="/api/classes/x_robot_validate.Ok.html#unwraperr">unwrapErr</RouterLink></li>
</ul>
<h2 id="constructors-1" tabindex="-1"><a class="header-anchor" href="#constructors-1" aria-hidden="true">#</a> Constructors</h2>
<h3 id="constructor" tabindex="-1"><a class="header-anchor" href="#constructor" aria-hidden="true">#</a> constructor</h3>
<p>• <strong>new Ok</strong>&lt;<code v-pre>T</code>, <code v-pre>E</code>&gt;(<code v-pre>value</code>)</p>
<h4 id="type-parameters-1" tabindex="-1"><a class="header-anchor" href="#type-parameters-1" aria-hidden="true">#</a> Type parameters</h4>
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
<h4 id="parameters" tabindex="-1"><a class="header-anchor" href="#parameters" aria-hidden="true">#</a> Parameters</h4>
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
<h2 id="properties-1" tabindex="-1"><a class="header-anchor" href="#properties-1" aria-hidden="true">#</a> Properties</h2>
<h3 id="value" tabindex="-1"><a class="header-anchor" href="#value" aria-hidden="true">#</a> value</h3>
<p>• <strong>value</strong>: <code v-pre>T</code></p>
<h4 id="defined-in" tabindex="-1"><a class="header-anchor" href="#defined-in" aria-hidden="true">#</a> Defined in</h4>
<p><a href="https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/validate/result.ts#L10" target="_blank" rel="noopener noreferrer">lib/validate/result.ts:10</a></p>
<h2 id="methods-1" tabindex="-1"><a class="header-anchor" href="#methods-1" aria-hidden="true">#</a> Methods</h2>
<h3 id="isok" tabindex="-1"><a class="header-anchor" href="#isok" aria-hidden="true">#</a> isOk</h3>
<p>▸ <strong>isOk</strong>(): this is Ok&lt;T, never&gt;</p>
<h4 id="returns" tabindex="-1"><a class="header-anchor" href="#returns" aria-hidden="true">#</a> Returns</h4>
<p>this is Ok&lt;T, never&gt;</p>
<hr>
<h3 id="iserr" tabindex="-1"><a class="header-anchor" href="#iserr" aria-hidden="true">#</a> isErr</h3>
<p>▸ <strong>isErr</strong>(): this is Err&lt;never, E&gt;</p>
<h4 id="returns-1" tabindex="-1"><a class="header-anchor" href="#returns-1" aria-hidden="true">#</a> Returns</h4>
<p>this is Err&lt;never, E&gt;</p>
<hr>
<h3 id="unwrap" tabindex="-1"><a class="header-anchor" href="#unwrap" aria-hidden="true">#</a> unwrap</h3>
<p>▸ <strong>unwrap</strong>(): <code v-pre>T</code></p>
<h4 id="returns-2" tabindex="-1"><a class="header-anchor" href="#returns-2" aria-hidden="true">#</a> Returns</h4>
<p><code v-pre>T</code></p>
<hr>
<h3 id="unwraperr" tabindex="-1"><a class="header-anchor" href="#unwraperr" aria-hidden="true">#</a> unwrapErr</h3>
<p>▸ <strong>unwrapErr</strong>(): <code v-pre>never</code></p>
<h4 id="returns-3" tabindex="-1"><a class="header-anchor" href="#returns-3" aria-hidden="true">#</a> Returns</h4>
<p><code v-pre>never</code></p>
</div></template>
