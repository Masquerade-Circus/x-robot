<template><div><p><RouterLink to="/api/">Api</RouterLink> / x-robot/utils</p>
<h1 id="module-x-robot-utils" tabindex="-1"><a class="header-anchor" href="#module-x-robot-utils" aria-hidden="true">#</a> Module: x-robot/utils</h1>
<h2 id="table-of-contents" tabindex="-1"><a class="header-anchor" href="#table-of-contents" aria-hidden="true">#</a> Table of contents</h2>
<h3 id="functions" tabindex="-1"><a class="header-anchor" href="#functions" aria-hidden="true">#</a> Functions</h3>
<ul>
<li><RouterLink to="/api/modules/x_robot_utils.html#isvalidstring">isValidString</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isvalidobject">isValidObject</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isproducer">isProducer</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isproducerwithtransition">isProducerWithTransition</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isproducerwithouttransition">isProducerWithoutTransition</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isaction">isAction</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isimmediate">isImmediate</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isguard">isGuard</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isnestedguard">isNestedGuard</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#istransition">isTransition</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#hastransition">hasTransition</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#hasstate">hasState</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isnestedmachinedirective">isNestedMachineDirective</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isnestedmachinewithtransitiondirective">isNestedMachineWithTransitionDirective</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#ismachine">isMachine</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isstatedirective">isStateDirective</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#iscontextdirective">isContextDirective</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isstatesdirective">isStatesDirective</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isparalleldirective">isParallelDirective</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isshouldfreezedirective">isShouldFreezeDirective</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isinitialdirective">isInitialDirective</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isdescriptiondirective">isDescriptionDirective</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isnestedtransition">isNestedTransition</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isparalleltransition">isParallelTransition</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isnestedimmediatedirective">isNestedImmediateDirective</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#isparallelimmediatedirective">isParallelImmediateDirective</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#deepfreeze">deepFreeze</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#clonecontext">cloneContext</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#canmaketransition">canMakeTransition</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot_utils.html#titletoid">titleToId</RouterLink></li>
</ul>
<h2 id="functions-1" tabindex="-1"><a class="header-anchor" href="#functions-1" aria-hidden="true">#</a> Functions</h2>
<h3 id="isvalidstring" tabindex="-1"><a class="header-anchor" href="#isvalidstring" aria-hidden="true">#</a> isValidString</h3>
<p>▸ <strong>isValidString</strong>(<code v-pre>str?</code>): str is string</p>
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
<td style="text-align:left"><code v-pre>str?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns" tabindex="-1"><a class="header-anchor" href="#returns" aria-hidden="true">#</a> Returns</h4>
<p>str is string</p>
<hr>
<h3 id="isvalidobject" tabindex="-1"><a class="header-anchor" href="#isvalidobject" aria-hidden="true">#</a> isValidObject</h3>
<p>▸ <strong>isValidObject</strong>(<code v-pre>obj</code>): obj is object</p>
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
<td style="text-align:left"><code v-pre>obj</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-1" tabindex="-1"><a class="header-anchor" href="#returns-1" aria-hidden="true">#</a> Returns</h4>
<p>obj is object</p>
<hr>
<h3 id="isproducer" tabindex="-1"><a class="header-anchor" href="#isproducer" aria-hidden="true">#</a> isProducer</h3>
<p>▸ <strong>isProducer</strong>(<code v-pre>producer?</code>): producer is ProducerDirective</p>
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
<td style="text-align:left"><code v-pre>producer?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-2" tabindex="-1"><a class="header-anchor" href="#returns-2" aria-hidden="true">#</a> Returns</h4>
<p>producer is ProducerDirective</p>
<hr>
<h3 id="isproducerwithtransition" tabindex="-1"><a class="header-anchor" href="#isproducerwithtransition" aria-hidden="true">#</a> isProducerWithTransition</h3>
<p>▸ <strong>isProducerWithTransition</strong>(<code v-pre>producer?</code>): producer is ProducerDirectiveWithTransition</p>
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
<td style="text-align:left"><code v-pre>producer?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-3" tabindex="-1"><a class="header-anchor" href="#returns-3" aria-hidden="true">#</a> Returns</h4>
<p>producer is ProducerDirectiveWithTransition</p>
<hr>
<h3 id="isproducerwithouttransition" tabindex="-1"><a class="header-anchor" href="#isproducerwithouttransition" aria-hidden="true">#</a> isProducerWithoutTransition</h3>
<p>▸ <strong>isProducerWithoutTransition</strong>(<code v-pre>producer?</code>): producer is ProducerDirectiveWithoutTransition</p>
<h4 id="parameters-4" tabindex="-1"><a class="header-anchor" href="#parameters-4" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>producer?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-4" tabindex="-1"><a class="header-anchor" href="#returns-4" aria-hidden="true">#</a> Returns</h4>
<p>producer is ProducerDirectiveWithoutTransition</p>
<hr>
<h3 id="isaction" tabindex="-1"><a class="header-anchor" href="#isaction" aria-hidden="true">#</a> isAction</h3>
<p>▸ <strong>isAction</strong>(<code v-pre>action?</code>): action is ActionDirective</p>
<h4 id="parameters-5" tabindex="-1"><a class="header-anchor" href="#parameters-5" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>action?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-5" tabindex="-1"><a class="header-anchor" href="#returns-5" aria-hidden="true">#</a> Returns</h4>
<p>action is ActionDirective</p>
<hr>
<h3 id="isimmediate" tabindex="-1"><a class="header-anchor" href="#isimmediate" aria-hidden="true">#</a> isImmediate</h3>
<p>▸ <strong>isImmediate</strong>(<code v-pre>immediate?</code>): immediate is ImmediateDirective</p>
<h4 id="parameters-6" tabindex="-1"><a class="header-anchor" href="#parameters-6" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>immediate?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-6" tabindex="-1"><a class="header-anchor" href="#returns-6" aria-hidden="true">#</a> Returns</h4>
<p>immediate is ImmediateDirective</p>
<hr>
<h3 id="isguard" tabindex="-1"><a class="header-anchor" href="#isguard" aria-hidden="true">#</a> isGuard</h3>
<p>▸ <strong>isGuard</strong>(<code v-pre>guard?</code>): guard is GuardDirective</p>
<h4 id="parameters-7" tabindex="-1"><a class="header-anchor" href="#parameters-7" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>guard?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-7" tabindex="-1"><a class="header-anchor" href="#returns-7" aria-hidden="true">#</a> Returns</h4>
<p>guard is GuardDirective</p>
<hr>
<h3 id="isnestedguard" tabindex="-1"><a class="header-anchor" href="#isnestedguard" aria-hidden="true">#</a> isNestedGuard</h3>
<p>▸ <strong>isNestedGuard</strong>(<code v-pre>guard?</code>): guard is NestedGuardDirective</p>
<h4 id="parameters-8" tabindex="-1"><a class="header-anchor" href="#parameters-8" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>guard?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-8" tabindex="-1"><a class="header-anchor" href="#returns-8" aria-hidden="true">#</a> Returns</h4>
<p>guard is NestedGuardDirective</p>
<hr>
<h3 id="istransition" tabindex="-1"><a class="header-anchor" href="#istransition" aria-hidden="true">#</a> isTransition</h3>
<p>▸ <strong>isTransition</strong>(<code v-pre>transition?</code>): transition is TransitionDirective</p>
<h4 id="parameters-9" tabindex="-1"><a class="header-anchor" href="#parameters-9" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>transition?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-9" tabindex="-1"><a class="header-anchor" href="#returns-9" aria-hidden="true">#</a> Returns</h4>
<p>transition is TransitionDirective</p>
<hr>
<h3 id="hastransition" tabindex="-1"><a class="header-anchor" href="#hastransition" aria-hidden="true">#</a> hasTransition</h3>
<p>▸ <strong>hasTransition</strong>(<code v-pre>state</code>, <code v-pre>transition</code>): <code v-pre>boolean</code></p>
<h4 id="parameters-10" tabindex="-1"><a class="header-anchor" href="#parameters-10" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>state</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.StateDirective.html"><code v-pre>StateDirective</code></RouterLink></td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>transition</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-10" tabindex="-1"><a class="header-anchor" href="#returns-10" aria-hidden="true">#</a> Returns</h4>
<p><code v-pre>boolean</code></p>
<hr>
<h3 id="hasstate" tabindex="-1"><a class="header-anchor" href="#hasstate" aria-hidden="true">#</a> hasState</h3>
<p>▸ <strong>hasState</strong>(<code v-pre>machine</code>, <code v-pre>state</code>): <code v-pre>boolean</code></p>
<h4 id="parameters-11" tabindex="-1"><a class="header-anchor" href="#parameters-11" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>machine</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.Machine.html"><code v-pre>Machine</code></RouterLink></td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>state</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-11" tabindex="-1"><a class="header-anchor" href="#returns-11" aria-hidden="true">#</a> Returns</h4>
<p><code v-pre>boolean</code></p>
<hr>
<h3 id="isnestedmachinedirective" tabindex="-1"><a class="header-anchor" href="#isnestedmachinedirective" aria-hidden="true">#</a> isNestedMachineDirective</h3>
<p>▸ <strong>isNestedMachineDirective</strong>(<code v-pre>machine?</code>): machine is NestedMachineDirective</p>
<h4 id="parameters-12" tabindex="-1"><a class="header-anchor" href="#parameters-12" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>machine?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-12" tabindex="-1"><a class="header-anchor" href="#returns-12" aria-hidden="true">#</a> Returns</h4>
<p>machine is NestedMachineDirective</p>
<hr>
<h3 id="isnestedmachinewithtransitiondirective" tabindex="-1"><a class="header-anchor" href="#isnestedmachinewithtransitiondirective" aria-hidden="true">#</a> isNestedMachineWithTransitionDirective</h3>
<p>▸ <strong>isNestedMachineWithTransitionDirective</strong>(<code v-pre>machine?</code>): machine is NestedMachineWithTransitionDirective</p>
<h4 id="parameters-13" tabindex="-1"><a class="header-anchor" href="#parameters-13" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>machine?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-13" tabindex="-1"><a class="header-anchor" href="#returns-13" aria-hidden="true">#</a> Returns</h4>
<p>machine is NestedMachineWithTransitionDirective</p>
<hr>
<h3 id="ismachine" tabindex="-1"><a class="header-anchor" href="#ismachine" aria-hidden="true">#</a> isMachine</h3>
<p>▸ <strong>isMachine</strong>(<code v-pre>machine?</code>): machine is Machine</p>
<h4 id="parameters-14" tabindex="-1"><a class="header-anchor" href="#parameters-14" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>machine?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-14" tabindex="-1"><a class="header-anchor" href="#returns-14" aria-hidden="true">#</a> Returns</h4>
<p>machine is Machine</p>
<hr>
<h3 id="isstatedirective" tabindex="-1"><a class="header-anchor" href="#isstatedirective" aria-hidden="true">#</a> isStateDirective</h3>
<p>▸ <strong>isStateDirective</strong>(<code v-pre>state?</code>): state is StateDirective</p>
<h4 id="parameters-15" tabindex="-1"><a class="header-anchor" href="#parameters-15" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>state?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-15" tabindex="-1"><a class="header-anchor" href="#returns-15" aria-hidden="true">#</a> Returns</h4>
<p>state is StateDirective</p>
<hr>
<h3 id="iscontextdirective" tabindex="-1"><a class="header-anchor" href="#iscontextdirective" aria-hidden="true">#</a> isContextDirective</h3>
<p>▸ <strong>isContextDirective</strong>(<code v-pre>context?</code>): context is ContextDirective</p>
<h4 id="parameters-16" tabindex="-1"><a class="header-anchor" href="#parameters-16" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>context?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-16" tabindex="-1"><a class="header-anchor" href="#returns-16" aria-hidden="true">#</a> Returns</h4>
<p>context is ContextDirective</p>
<hr>
<h3 id="isstatesdirective" tabindex="-1"><a class="header-anchor" href="#isstatesdirective" aria-hidden="true">#</a> isStatesDirective</h3>
<p>▸ <strong>isStatesDirective</strong>(<code v-pre>states?</code>): states is StatesDirective</p>
<h4 id="parameters-17" tabindex="-1"><a class="header-anchor" href="#parameters-17" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>states?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-17" tabindex="-1"><a class="header-anchor" href="#returns-17" aria-hidden="true">#</a> Returns</h4>
<p>states is StatesDirective</p>
<hr>
<h3 id="isparalleldirective" tabindex="-1"><a class="header-anchor" href="#isparalleldirective" aria-hidden="true">#</a> isParallelDirective</h3>
<p>▸ <strong>isParallelDirective</strong>(<code v-pre>parallel?</code>): parallel is ParallelDirective</p>
<h4 id="parameters-18" tabindex="-1"><a class="header-anchor" href="#parameters-18" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>parallel?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-18" tabindex="-1"><a class="header-anchor" href="#returns-18" aria-hidden="true">#</a> Returns</h4>
<p>parallel is ParallelDirective</p>
<hr>
<h3 id="isshouldfreezedirective" tabindex="-1"><a class="header-anchor" href="#isshouldfreezedirective" aria-hidden="true">#</a> isShouldFreezeDirective</h3>
<p>▸ <strong>isShouldFreezeDirective</strong>(<code v-pre>shouldFreeze?</code>): shouldFreeze is ShouldFreezeDirective</p>
<h4 id="parameters-19" tabindex="-1"><a class="header-anchor" href="#parameters-19" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>shouldFreeze?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-19" tabindex="-1"><a class="header-anchor" href="#returns-19" aria-hidden="true">#</a> Returns</h4>
<p>shouldFreeze is ShouldFreezeDirective</p>
<hr>
<h3 id="isinitialdirective" tabindex="-1"><a class="header-anchor" href="#isinitialdirective" aria-hidden="true">#</a> isInitialDirective</h3>
<p>▸ <strong>isInitialDirective</strong>(<code v-pre>initial?</code>): initial is InitialDirective</p>
<h4 id="parameters-20" tabindex="-1"><a class="header-anchor" href="#parameters-20" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>initial?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-20" tabindex="-1"><a class="header-anchor" href="#returns-20" aria-hidden="true">#</a> Returns</h4>
<p>initial is InitialDirective</p>
<hr>
<h3 id="isdescriptiondirective" tabindex="-1"><a class="header-anchor" href="#isdescriptiondirective" aria-hidden="true">#</a> isDescriptionDirective</h3>
<p>▸ <strong>isDescriptionDirective</strong>(<code v-pre>description?</code>): description is DescriptionDirective</p>
<h4 id="parameters-21" tabindex="-1"><a class="header-anchor" href="#parameters-21" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>description?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-21" tabindex="-1"><a class="header-anchor" href="#returns-21" aria-hidden="true">#</a> Returns</h4>
<p>description is DescriptionDirective</p>
<hr>
<h3 id="isnestedtransition" tabindex="-1"><a class="header-anchor" href="#isnestedtransition" aria-hidden="true">#</a> isNestedTransition</h3>
<p>▸ <strong>isNestedTransition</strong>(<code v-pre>transition?</code>): <code v-pre>boolean</code></p>
<h4 id="parameters-22" tabindex="-1"><a class="header-anchor" href="#parameters-22" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>transition?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-22" tabindex="-1"><a class="header-anchor" href="#returns-22" aria-hidden="true">#</a> Returns</h4>
<p><code v-pre>boolean</code></p>
<hr>
<h3 id="isparalleltransition" tabindex="-1"><a class="header-anchor" href="#isparalleltransition" aria-hidden="true">#</a> isParallelTransition</h3>
<p>▸ <strong>isParallelTransition</strong>(<code v-pre>transition?</code>): <code v-pre>boolean</code></p>
<h4 id="parameters-23" tabindex="-1"><a class="header-anchor" href="#parameters-23" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>transition?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-23" tabindex="-1"><a class="header-anchor" href="#returns-23" aria-hidden="true">#</a> Returns</h4>
<p><code v-pre>boolean</code></p>
<hr>
<h3 id="isnestedimmediatedirective" tabindex="-1"><a class="header-anchor" href="#isnestedimmediatedirective" aria-hidden="true">#</a> isNestedImmediateDirective</h3>
<p>▸ <strong>isNestedImmediateDirective</strong>(<code v-pre>immediate?</code>): immediate is NestedImmediateDirective</p>
<h4 id="parameters-24" tabindex="-1"><a class="header-anchor" href="#parameters-24" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>immediate?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-24" tabindex="-1"><a class="header-anchor" href="#returns-24" aria-hidden="true">#</a> Returns</h4>
<p>immediate is NestedImmediateDirective</p>
<hr>
<h3 id="isparallelimmediatedirective" tabindex="-1"><a class="header-anchor" href="#isparallelimmediatedirective" aria-hidden="true">#</a> isParallelImmediateDirective</h3>
<p>▸ <strong>isParallelImmediateDirective</strong>(<code v-pre>immediate?</code>): immediate is ParallelImmediateDirective</p>
<h4 id="parameters-25" tabindex="-1"><a class="header-anchor" href="#parameters-25" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>immediate?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-25" tabindex="-1"><a class="header-anchor" href="#returns-25" aria-hidden="true">#</a> Returns</h4>
<p>immediate is ParallelImmediateDirective</p>
<hr>
<h3 id="deepfreeze" tabindex="-1"><a class="header-anchor" href="#deepfreeze" aria-hidden="true">#</a> deepFreeze</h3>
<p>▸ <strong>deepFreeze</strong>(<code v-pre>obj</code>): <code v-pre>any</code></p>
<p>This method is used to deep freeze an object</p>
<h4 id="parameters-26" tabindex="-1"><a class="header-anchor" href="#parameters-26" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left"><code v-pre>obj</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
<td style="text-align:left">The object to freeze</td>
</tr>
</tbody>
</table>
<h4 id="returns-26" tabindex="-1"><a class="header-anchor" href="#returns-26" aria-hidden="true">#</a> Returns</h4>
<p><code v-pre>any</code></p>
<p>Object frozen</p>
<hr>
<h3 id="clonecontext" tabindex="-1"><a class="header-anchor" href="#clonecontext" aria-hidden="true">#</a> cloneContext</h3>
<p>▸ <strong>cloneContext</strong>(<code v-pre>context</code>, <code v-pre>weakMap?</code>): <code v-pre>any</code></p>
<h4 id="parameters-27" tabindex="-1"><a class="header-anchor" href="#parameters-27" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>context</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>weakMap</code></td>
<td style="text-align:left"><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap" target="_blank" rel="noopener noreferrer"><code v-pre>WeakMap</code></a>&lt;<code v-pre>object</code>, <code v-pre>any</code>&gt;</td>
</tr>
</tbody>
</table>
<h4 id="returns-27" tabindex="-1"><a class="header-anchor" href="#returns-27" aria-hidden="true">#</a> Returns</h4>
<p><code v-pre>any</code></p>
<hr>
<h3 id="canmaketransition" tabindex="-1"><a class="header-anchor" href="#canmaketransition" aria-hidden="true">#</a> canMakeTransition</h3>
<p>▸ <strong>canMakeTransition</strong>(<code v-pre>machine</code>, <code v-pre>currentStateObject</code>, <code v-pre>transition</code>): <code v-pre>boolean</code></p>
<h4 id="parameters-28" tabindex="-1"><a class="header-anchor" href="#parameters-28" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left">The machine that is currently running</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>currentStateObject</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.StateDirective.html"><code v-pre>StateDirective</code></RouterLink></td>
<td style="text-align:left">The current state of the machine</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>transition</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
<td style="text-align:left">The transition that we want to execute</td>
</tr>
</tbody>
</table>
<h4 id="returns-28" tabindex="-1"><a class="header-anchor" href="#returns-28" aria-hidden="true">#</a> Returns</h4>
<p><code v-pre>boolean</code></p>
<p>boolean true if the transition can be executed, false otherwise</p>
<hr>
<h3 id="titletoid" tabindex="-1"><a class="header-anchor" href="#titletoid" aria-hidden="true">#</a> titleToId</h3>
<p>▸ <strong>titleToId</strong>(<code v-pre>str</code>): <code v-pre>string</code></p>
<h4 id="parameters-29" tabindex="-1"><a class="header-anchor" href="#parameters-29" aria-hidden="true">#</a> Parameters</h4>
<table>
<thead>
<tr>
<th style="text-align:left">Name</th>
<th style="text-align:left">Type</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:left"><code v-pre>str</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
</tr>
</tbody>
</table>
<h4 id="returns-29" tabindex="-1"><a class="header-anchor" href="#returns-29" aria-hidden="true">#</a> Returns</h4>
<p><code v-pre>string</code></p>
</div></template>
