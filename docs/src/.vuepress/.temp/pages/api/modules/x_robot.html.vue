<template><div><p><RouterLink to="/api/">Api</RouterLink> / x-robot</p>
<h1 id="module-x-robot" tabindex="-1"><a class="header-anchor" href="#module-x-robot" aria-hidden="true">#</a> Module: x-robot</h1>
<p><strong><code v-pre>Description</code></strong></p>
<p>X-Robot is a finite state machine library for nodejs and for the web.</p>
<h2 id="table-of-contents" tabindex="-1"><a class="header-anchor" href="#table-of-contents" aria-hidden="true">#</a> Table of contents</h2>
<h3 id="creation-functions" tabindex="-1"><a class="header-anchor" href="#creation-functions" aria-hidden="true">#</a> Creation Functions</h3>
<ul>
<li><RouterLink to="/api/modules/x_robot.html#machine">machine</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#states">states</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#parallel">parallel</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#context">context</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#initial">initial</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#shouldfreeze">shouldFreeze</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#state">state</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#transition">transition</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#action">action</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#guard">guard</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#producer">producer</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#immediate">immediate</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#nestedguard">nestedGuard</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#nested">nested</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#description">description</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#infostate">infoState</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#primarystate">primaryState</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#successstate">successState</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#warningstate">warningState</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#dangerstate">dangerState</RouterLink></li>
</ul>
<h3 id="invocation-functions" tabindex="-1"><a class="header-anchor" href="#invocation-functions" aria-hidden="true">#</a> Invocation Functions</h3>
<ul>
<li><RouterLink to="/api/modules/x_robot.html#invoke">invoke</RouterLink></li>
<li><RouterLink to="/api/modules/x_robot.html#start">start</RouterLink></li>
</ul>
<h3 id="state-functions" tabindex="-1"><a class="header-anchor" href="#state-functions" aria-hidden="true">#</a> State Functions</h3>
<ul>
<li><RouterLink to="/api/modules/x_robot.html#getstate">getState</RouterLink></li>
</ul>
<h3 id="type-aliases" tabindex="-1"><a class="header-anchor" href="#type-aliases" aria-hidden="true">#</a> Type Aliases</h3>
<ul>
<li><RouterLink to="/api/modules/x_robot.html#currentstate">CurrentState</RouterLink></li>
</ul>
<h3 id="interfaces" tabindex="-1"><a class="header-anchor" href="#interfaces" aria-hidden="true">#</a> Interfaces</h3>
<ul>
<li><RouterLink to="/api/interfaces/x_robot.AllStates.html">AllStates</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.MachineArguments.html">MachineArguments</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.Context.html">Context</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.TransitionDirective.html">TransitionDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.TransitionsDirective.html">TransitionsDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.ImmediateDirective.html">ImmediateDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.NestedImmediateDirective.html">NestedImmediateDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.ParallelImmediateDirective.html">ParallelImmediateDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.Producer.html">Producer</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.ProducerDirective.html">ProducerDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.ProducerDirectiveWithTransition.html">ProducerDirectiveWithTransition</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.ProducerDirectiveWithoutTransition.html">ProducerDirectiveWithoutTransition</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.Action.html">Action</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.ActionDirective.html">ActionDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.Guard.html">Guard</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.GuardDirective.html">GuardDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.NestedGuardDirective.html">NestedGuardDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.GuardsDirective.html">GuardsDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.DescriptionDirective.html">DescriptionDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.RunCollection.html">RunCollection</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.StateDirective.html">StateDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.InfoStateDirective.html">InfoStateDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.WarningStateDirective.html">WarningStateDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.DangerStateDirective.html">DangerStateDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.PrimaryStateDirective.html">PrimaryStateDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.SuccessStateDirective.html">SuccessStateDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.StatesDirective.html">StatesDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.ParallelDirective.html">ParallelDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.Machine.html">Machine</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.NestedMachineDirective.html">NestedMachineDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.NestedMachineWithTransitionDirective.html">NestedMachineWithTransitionDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.ContextDirective.html">ContextDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.InitialDirective.html">InitialDirective</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.ShouldFreezeDirective.html">ShouldFreezeDirective</RouterLink></li>
</ul>
<h3 id="enumerations" tabindex="-1"><a class="header-anchor" href="#enumerations" aria-hidden="true">#</a> Enumerations</h3>
<ul>
<li><RouterLink to="/api/enums/x_robot.HistoryType.html">HistoryType</RouterLink></li>
</ul>
<h3 id="variables" tabindex="-1"><a class="header-anchor" href="#variables" aria-hidden="true">#</a> Variables</h3>
<ul>
<li><RouterLink to="/api/modules/x_robot.html#start_event">START_EVENT</RouterLink></li>
</ul>
<h2 id="creation-functions-1" tabindex="-1"><a class="header-anchor" href="#creation-functions-1" aria-hidden="true">#</a> Creation Functions</h2>
<h3 id="machine" tabindex="-1"><a class="header-anchor" href="#machine" aria-hidden="true">#</a> machine</h3>
<p>▸ <strong>machine</strong>(<code v-pre>title</code>, ...<code v-pre>args</code>): <RouterLink to="/api/interfaces/x_robot.Machine.html"><code v-pre>Machine</code></RouterLink></p>
<p>Creates a new machine</p>
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
<td style="text-align:left"><code v-pre>title</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
<td style="text-align:left">Title of the machine - This will be used to generate the id of the machine</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>...args</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.MachineArguments.html"><code v-pre>MachineArguments</code></RouterLink></td>
<td style="text-align:left">Arguments to the machine</td>
</tr>
</tbody>
</table>
<h4 id="returns" tabindex="-1"><a class="header-anchor" href="#returns" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.Machine.html"><code v-pre>Machine</code></RouterLink></p>
<p>Machine</p>
<hr>
<h3 id="states" tabindex="-1"><a class="header-anchor" href="#states" aria-hidden="true">#</a> states</h3>
<p>▸ <strong>states</strong>(...<code v-pre>states</code>): <RouterLink to="/api/interfaces/x_robot.StatesDirective.html"><code v-pre>StatesDirective</code></RouterLink></p>
<h4 id="parameters-1" tabindex="-1"><a class="header-anchor" href="#parameters-1" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left"><code v-pre>...states</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.StateDirective.html"><code v-pre>StateDirective</code></RouterLink>[]</td>
<td style="text-align:left">Array of state directives made with the state method</td>
</tr>
</tbody>
</table>
<h4 id="returns-1" tabindex="-1"><a class="header-anchor" href="#returns-1" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.StatesDirective.html"><code v-pre>StatesDirective</code></RouterLink></p>
<p>StatesDirective</p>
<hr>
<h3 id="parallel" tabindex="-1"><a class="header-anchor" href="#parallel" aria-hidden="true">#</a> parallel</h3>
<p>▸ <strong>parallel</strong>(...<code v-pre>machines</code>): <RouterLink to="/api/interfaces/x_robot.ParallelDirective.html"><code v-pre>ParallelDirective</code></RouterLink></p>
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
<td style="text-align:left"><code v-pre>...machines</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.Machine.html"><code v-pre>Machine</code></RouterLink>[]</td>
<td style="text-align:left">Array of parallel machines</td>
</tr>
</tbody>
</table>
<h4 id="returns-2" tabindex="-1"><a class="header-anchor" href="#returns-2" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.ParallelDirective.html"><code v-pre>ParallelDirective</code></RouterLink></p>
<p>ParallelDirective</p>
<hr>
<h3 id="context" tabindex="-1"><a class="header-anchor" href="#context" aria-hidden="true">#</a> context</h3>
<p>▸ <strong>context</strong>(<code v-pre>context</code>): <RouterLink to="/api/interfaces/x_robot.ContextDirective.html"><code v-pre>ContextDirective</code></RouterLink></p>
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
<td style="text-align:left"><code v-pre>context</code></td>
<td style="text-align:left"><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function" target="_blank" rel="noopener noreferrer"><code v-pre>Function</code></a> | <RouterLink to="/api/interfaces/x_robot.Context.html"><code v-pre>Context</code></RouterLink></td>
<td style="text-align:left">The context to be passed to the machine, can be a function that returns an object</td>
</tr>
</tbody>
</table>
<h4 id="returns-3" tabindex="-1"><a class="header-anchor" href="#returns-3" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.ContextDirective.html"><code v-pre>ContextDirective</code></RouterLink></p>
<p>ContextDirective</p>
<hr>
<h3 id="initial" tabindex="-1"><a class="header-anchor" href="#initial" aria-hidden="true">#</a> initial</h3>
<p>▸ <strong>initial</strong>(<code v-pre>initial</code>): <RouterLink to="/api/interfaces/x_robot.InitialDirective.html"><code v-pre>InitialDirective</code></RouterLink></p>
<h4 id="parameters-4" tabindex="-1"><a class="header-anchor" href="#parameters-4" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left"><code v-pre>initial</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
<td style="text-align:left">The initial state of the machine</td>
</tr>
</tbody>
</table>
<h4 id="returns-4" tabindex="-1"><a class="header-anchor" href="#returns-4" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.InitialDirective.html"><code v-pre>InitialDirective</code></RouterLink></p>
<p>InitialDirective</p>
<hr>
<h3 id="shouldfreeze" tabindex="-1"><a class="header-anchor" href="#shouldfreeze" aria-hidden="true">#</a> shouldFreeze</h3>
<p>▸ <strong>shouldFreeze</strong>(<code v-pre>freeze</code>): <RouterLink to="/api/interfaces/x_robot.ShouldFreezeDirective.html"><code v-pre>ShouldFreezeDirective</code></RouterLink></p>
<h4 id="parameters-5" tabindex="-1"><a class="header-anchor" href="#parameters-5" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left"><code v-pre>freeze</code></td>
<td style="text-align:left"><code v-pre>boolean</code></td>
<td style="text-align:left">If false the machine will not be frozen. The machine will be frozen by default.</td>
</tr>
</tbody>
</table>
<h4 id="returns-5" tabindex="-1"><a class="header-anchor" href="#returns-5" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.ShouldFreezeDirective.html"><code v-pre>ShouldFreezeDirective</code></RouterLink></p>
<p>ShouldFreezeDirective</p>
<hr>
<h3 id="state" tabindex="-1"><a class="header-anchor" href="#state" aria-hidden="true">#</a> state</h3>
<p>▸ <strong>state</strong>(<code v-pre>name</code>, ...<code v-pre>args</code>): <RouterLink to="/api/interfaces/x_robot.StateDirective.html"><code v-pre>StateDirective</code></RouterLink></p>
<h4 id="parameters-6" tabindex="-1"><a class="header-anchor" href="#parameters-6" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left"><code v-pre>name</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
<td style="text-align:left">The name of the state</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>...args</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.RunCollection.html"><code v-pre>RunCollection</code></RouterLink></td>
<td style="text-align:left">nested machines, actions, producers, transitions, etc.</td>
</tr>
</tbody>
</table>
<h4 id="returns-6" tabindex="-1"><a class="header-anchor" href="#returns-6" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.StateDirective.html"><code v-pre>StateDirective</code></RouterLink></p>
<p>StateDirective</p>
<hr>
<h3 id="transition" tabindex="-1"><a class="header-anchor" href="#transition" aria-hidden="true">#</a> transition</h3>
<p>▸ <strong>transition</strong>(<code v-pre>transitionName</code>, <code v-pre>target</code>, ...<code v-pre>guards</code>): <RouterLink to="/api/interfaces/x_robot.TransitionDirective.html"><code v-pre>TransitionDirective</code></RouterLink></p>
<h4 id="parameters-7" tabindex="-1"><a class="header-anchor" href="#parameters-7" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left"><code v-pre>transitionName</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
<td style="text-align:left">The name of the transition</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>target</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
<td style="text-align:left">The target state of the transition</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>...guards</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.GuardsDirective.html"><code v-pre>GuardsDirective</code></RouterLink></td>
<td style="text-align:left">The guards of the transition</td>
</tr>
</tbody>
</table>
<h4 id="returns-7" tabindex="-1"><a class="header-anchor" href="#returns-7" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.TransitionDirective.html"><code v-pre>TransitionDirective</code></RouterLink></p>
<p>TransitionDirective</p>
<hr>
<h3 id="action" tabindex="-1"><a class="header-anchor" href="#action" aria-hidden="true">#</a> action</h3>
<p>▸ <strong>action</strong>(<code v-pre>action</code>, <code v-pre>onSuccessProducer?</code>, <code v-pre>onFailureProducer?</code>): <RouterLink to="/api/interfaces/x_robot.ActionDirective.html"><code v-pre>ActionDirective</code></RouterLink></p>
<h4 id="parameters-8" tabindex="-1"><a class="header-anchor" href="#parameters-8" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left"><code v-pre>action</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.Action.html"><code v-pre>Action</code></RouterLink></td>
<td style="text-align:left">The action to be run</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>onSuccessProducer?</code></td>
<td style="text-align:left"><code v-pre>null</code> | <code v-pre>string</code> | <RouterLink to="/api/interfaces/x_robot.ProducerDirective.html"><code v-pre>ProducerDirective</code></RouterLink></td>
<td style="text-align:left">The producer to be run on success with an optional transition name or a transition name</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>onFailureProducer?</code></td>
<td style="text-align:left"><code v-pre>null</code> | <code v-pre>string</code> | <RouterLink to="/api/interfaces/x_robot.ProducerDirective.html"><code v-pre>ProducerDirective</code></RouterLink></td>
<td style="text-align:left">The producer to be run on failure with an optional transition name or a transition name</td>
</tr>
</tbody>
</table>
<h4 id="returns-8" tabindex="-1"><a class="header-anchor" href="#returns-8" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.ActionDirective.html"><code v-pre>ActionDirective</code></RouterLink></p>
<p>ActionDirective</p>
<hr>
<h3 id="guard" tabindex="-1"><a class="header-anchor" href="#guard" aria-hidden="true">#</a> guard</h3>
<p>▸ <strong>guard</strong>(<code v-pre>guard</code>, <code v-pre>onFailureProducer?</code>): <RouterLink to="/api/interfaces/x_robot.GuardDirective.html"><code v-pre>GuardDirective</code></RouterLink></p>
<h4 id="parameters-9" tabindex="-1"><a class="header-anchor" href="#parameters-9" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left"><code v-pre>guard</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.Guard.html"><code v-pre>Guard</code></RouterLink></td>
<td style="text-align:left">The guard to be run</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>onFailureProducer?</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.ProducerDirectiveWithoutTransition.html"><code v-pre>ProducerDirectiveWithoutTransition</code></RouterLink></td>
<td style="text-align:left">The producer to be run on failure, this producer should not have a transition name</td>
</tr>
</tbody>
</table>
<h4 id="returns-9" tabindex="-1"><a class="header-anchor" href="#returns-9" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.GuardDirective.html"><code v-pre>GuardDirective</code></RouterLink></p>
<p>GuardDirective</p>
<hr>
<h3 id="producer" tabindex="-1"><a class="header-anchor" href="#producer" aria-hidden="true">#</a> producer</h3>
<p>▸ <strong>producer</strong>(<code v-pre>producer</code>, <code v-pre>transition?</code>): <RouterLink to="/api/interfaces/x_robot.ProducerDirective.html"><code v-pre>ProducerDirective</code></RouterLink> | <RouterLink to="/api/interfaces/x_robot.ProducerDirectiveWithoutTransition.html"><code v-pre>ProducerDirectiveWithoutTransition</code></RouterLink></p>
<h4 id="parameters-10" tabindex="-1"><a class="header-anchor" href="#parameters-10" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left"><code v-pre>producer</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.Producer.html"><code v-pre>Producer</code></RouterLink></td>
<td style="text-align:left">The producer to be run</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>transition?</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
<td style="text-align:left">The transition to be run on producer processed if the logic in which the producer is run allows it</td>
</tr>
</tbody>
</table>
<h4 id="returns-10" tabindex="-1"><a class="header-anchor" href="#returns-10" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.ProducerDirective.html"><code v-pre>ProducerDirective</code></RouterLink> | <RouterLink to="/api/interfaces/x_robot.ProducerDirectiveWithoutTransition.html"><code v-pre>ProducerDirectiveWithoutTransition</code></RouterLink></p>
<p>ProducerDirective</p>
<hr>
<h3 id="immediate" tabindex="-1"><a class="header-anchor" href="#immediate" aria-hidden="true">#</a> immediate</h3>
<p>▸ <strong>immediate</strong>(<code v-pre>target</code>, ...<code v-pre>guards</code>): <RouterLink to="/api/interfaces/x_robot.ImmediateDirective.html"><code v-pre>ImmediateDirective</code></RouterLink></p>
<h4 id="parameters-11" tabindex="-1"><a class="header-anchor" href="#parameters-11" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left"><code v-pre>target</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
<td style="text-align:left">The target state of the transition</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>...guards</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.GuardsDirective.html"><code v-pre>GuardsDirective</code></RouterLink></td>
<td style="text-align:left">The guards of the transition</td>
</tr>
</tbody>
</table>
<h4 id="returns-11" tabindex="-1"><a class="header-anchor" href="#returns-11" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.ImmediateDirective.html"><code v-pre>ImmediateDirective</code></RouterLink></p>
<p>ImmediateDirective</p>
<hr>
<h3 id="nestedguard" tabindex="-1"><a class="header-anchor" href="#nestedguard" aria-hidden="true">#</a> nestedGuard</h3>
<p>▸ <strong>nestedGuard</strong>(<code v-pre>machine</code>, <code v-pre>guard</code>, <code v-pre>onFailureProducer?</code>): <RouterLink to="/api/interfaces/x_robot.NestedGuardDirective.html"><code v-pre>NestedGuardDirective</code></RouterLink></p>
<p>This method returns a nested guard directive.
It works like the guard directive but it receives the nested machine context as the first argument instead of the parent machine context.</p>
<h4 id="parameters-12" tabindex="-1"><a class="header-anchor" href="#parameters-12" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left">The nested machine to be run</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>guard</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.Guard.html"><code v-pre>Guard</code></RouterLink></td>
<td style="text-align:left">The guard to be run</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>onFailureProducer?</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.ProducerDirectiveWithoutTransition.html"><code v-pre>ProducerDirectiveWithoutTransition</code></RouterLink></td>
<td style="text-align:left">The producer to be run on failure, this producer should not have a transition name</td>
</tr>
</tbody>
</table>
<h4 id="returns-12" tabindex="-1"><a class="header-anchor" href="#returns-12" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.NestedGuardDirective.html"><code v-pre>NestedGuardDirective</code></RouterLink></p>
<p>NestedGuardDirective</p>
<hr>
<h3 id="nested" tabindex="-1"><a class="header-anchor" href="#nested" aria-hidden="true">#</a> nested</h3>
<p>▸ <strong>nested</strong>(<code v-pre>machine</code>, <code v-pre>transition?</code>): <RouterLink to="/api/interfaces/x_robot.NestedMachineDirective.html"><code v-pre>NestedMachineDirective</code></RouterLink></p>
<h4 id="parameters-13" tabindex="-1"><a class="header-anchor" href="#parameters-13" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left">The nested machine to be run</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>transition?</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
<td style="text-align:left">The transition to be run when the machine enters in the state that has the nested machine</td>
</tr>
</tbody>
</table>
<h4 id="returns-13" tabindex="-1"><a class="header-anchor" href="#returns-13" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.NestedMachineDirective.html"><code v-pre>NestedMachineDirective</code></RouterLink></p>
<p>NestedMachineDirective</p>
<hr>
<h3 id="description" tabindex="-1"><a class="header-anchor" href="#description" aria-hidden="true">#</a> description</h3>
<p>▸ <strong>description</strong>(<code v-pre>description</code>): <RouterLink to="/api/interfaces/x_robot.DescriptionDirective.html"><code v-pre>DescriptionDirective</code></RouterLink></p>
<p>This is used as documentation for the serialization and in the diagram generation of the machine.
Not to be used in the machine execution itself.</p>
<h4 id="parameters-14" tabindex="-1"><a class="header-anchor" href="#parameters-14" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left"><code v-pre>description</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
<td style="text-align:left">The description of the state</td>
</tr>
</tbody>
</table>
<h4 id="returns-14" tabindex="-1"><a class="header-anchor" href="#returns-14" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.DescriptionDirective.html"><code v-pre>DescriptionDirective</code></RouterLink></p>
<p>DescriptionDirective</p>
<hr>
<h3 id="infostate" tabindex="-1"><a class="header-anchor" href="#infostate" aria-hidden="true">#</a> infoState</h3>
<p>▸ <strong>infoState</strong>(<code v-pre>name</code>, ...<code v-pre>args</code>): <RouterLink to="/api/interfaces/x_robot.InfoStateDirective.html"><code v-pre>InfoStateDirective</code></RouterLink></p>
<p>State directive that represents an info state. This is used as documentation for the serialization and in the diagram generation of the machine.
Not to be used in the machine execution itself.</p>
<h4 id="parameters-15" tabindex="-1"><a class="header-anchor" href="#parameters-15" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left"><code v-pre>name</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
<td style="text-align:left">The name of the state</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>...args</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.RunCollection.html"><code v-pre>RunCollection</code></RouterLink></td>
<td style="text-align:left">nested machines, actions, producers, transitions, etc.</td>
</tr>
</tbody>
</table>
<h4 id="returns-15" tabindex="-1"><a class="header-anchor" href="#returns-15" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.InfoStateDirective.html"><code v-pre>InfoStateDirective</code></RouterLink></p>
<p>InfoStateDirective</p>
<hr>
<h3 id="primarystate" tabindex="-1"><a class="header-anchor" href="#primarystate" aria-hidden="true">#</a> primaryState</h3>
<p>▸ <strong>primaryState</strong>(<code v-pre>name</code>, ...<code v-pre>args</code>): <RouterLink to="/api/interfaces/x_robot.PrimaryStateDirective.html"><code v-pre>PrimaryStateDirective</code></RouterLink></p>
<p>State directive that represents a primary state. This is used as documentation for the serialization and in the diagram generation of the machine.
Not to be used in the machine execution itself.</p>
<h4 id="parameters-16" tabindex="-1"><a class="header-anchor" href="#parameters-16" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left"><code v-pre>name</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
<td style="text-align:left">The name of the state</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>...args</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.RunCollection.html"><code v-pre>RunCollection</code></RouterLink></td>
<td style="text-align:left">nested machines, actions, producers, transitions, etc.</td>
</tr>
</tbody>
</table>
<h4 id="returns-16" tabindex="-1"><a class="header-anchor" href="#returns-16" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.PrimaryStateDirective.html"><code v-pre>PrimaryStateDirective</code></RouterLink></p>
<p>PrimaryStateDirective</p>
<hr>
<h3 id="successstate" tabindex="-1"><a class="header-anchor" href="#successstate" aria-hidden="true">#</a> successState</h3>
<p>▸ <strong>successState</strong>(<code v-pre>name</code>, ...<code v-pre>args</code>): <RouterLink to="/api/interfaces/x_robot.SuccessStateDirective.html"><code v-pre>SuccessStateDirective</code></RouterLink></p>
<p>State directive that represents a success state. This is used as documentation for the serialization and in the diagram generation of the machine.
Not to be used in the machine execution itself.</p>
<h4 id="parameters-17" tabindex="-1"><a class="header-anchor" href="#parameters-17" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left"><code v-pre>name</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
<td style="text-align:left">The name of the state</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>...args</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.RunCollection.html"><code v-pre>RunCollection</code></RouterLink></td>
<td style="text-align:left">nested machines, actions, producers, transitions, etc.</td>
</tr>
</tbody>
</table>
<h4 id="returns-17" tabindex="-1"><a class="header-anchor" href="#returns-17" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.SuccessStateDirective.html"><code v-pre>SuccessStateDirective</code></RouterLink></p>
<p>SuccessStateDirective</p>
<hr>
<h3 id="warningstate" tabindex="-1"><a class="header-anchor" href="#warningstate" aria-hidden="true">#</a> warningState</h3>
<p>▸ <strong>warningState</strong>(<code v-pre>name</code>, ...<code v-pre>args</code>): <RouterLink to="/api/interfaces/x_robot.WarningStateDirective.html"><code v-pre>WarningStateDirective</code></RouterLink></p>
<p>State directive that represents a warning state. This is used as documentation for the serialization and in the diagram generation of the machine.
Not to be used in the machine execution itself.</p>
<h4 id="parameters-18" tabindex="-1"><a class="header-anchor" href="#parameters-18" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left"><code v-pre>name</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
<td style="text-align:left">The name of the state</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>...args</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.RunCollection.html"><code v-pre>RunCollection</code></RouterLink></td>
<td style="text-align:left">nested machines, actions, producers, transitions, etc.</td>
</tr>
</tbody>
</table>
<h4 id="returns-18" tabindex="-1"><a class="header-anchor" href="#returns-18" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.WarningStateDirective.html"><code v-pre>WarningStateDirective</code></RouterLink></p>
<p>WarningStateDirective</p>
<hr>
<h3 id="dangerstate" tabindex="-1"><a class="header-anchor" href="#dangerstate" aria-hidden="true">#</a> dangerState</h3>
<p>▸ <strong>dangerState</strong>(<code v-pre>name</code>, ...<code v-pre>args</code>): <RouterLink to="/api/interfaces/x_robot.DangerStateDirective.html"><code v-pre>DangerStateDirective</code></RouterLink></p>
<p>State directive that represents a danger state. This is used as documentation for the serialization and in the diagram generation of the machine.
Not to be used in the machine execution itself.</p>
<h4 id="parameters-19" tabindex="-1"><a class="header-anchor" href="#parameters-19" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left"><code v-pre>name</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
<td style="text-align:left">The name of the state</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>...args</code></td>
<td style="text-align:left"><RouterLink to="/api/interfaces/x_robot.RunCollection.html"><code v-pre>RunCollection</code></RouterLink></td>
<td style="text-align:left">nested machines, actions, producers, transitions, etc.</td>
</tr>
</tbody>
</table>
<h4 id="returns-19" tabindex="-1"><a class="header-anchor" href="#returns-19" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.DangerStateDirective.html"><code v-pre>DangerStateDirective</code></RouterLink></p>
<p>DangerStateDirective</p>
<hr>
<h2 id="invocation-functions-1" tabindex="-1"><a class="header-anchor" href="#invocation-functions-1" aria-hidden="true">#</a> Invocation Functions</h2>
<h3 id="invoke" tabindex="-1"><a class="header-anchor" href="#invoke" aria-hidden="true">#</a> invoke</h3>
<p>▸ <strong>invoke</strong>(<code v-pre>machine</code>, <code v-pre>transition</code>, <code v-pre>payload?</code>): <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise" target="_blank" rel="noopener noreferrer"><code v-pre>Promise</code></a>&lt;<code v-pre>void</code>&gt; | <code v-pre>void</code></p>
<h4 id="parameters-20" tabindex="-1"><a class="header-anchor" href="#parameters-20" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left">The machine to invoke the transition on</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>transition</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
<td style="text-align:left">The transition to invoke</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>payload?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
<td style="text-align:left">The optional payload to pass to the transition</td>
</tr>
</tbody>
</table>
<h4 id="returns-20" tabindex="-1"><a class="header-anchor" href="#returns-20" aria-hidden="true">#</a> Returns</h4>
<p><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise" target="_blank" rel="noopener noreferrer"><code v-pre>Promise</code></a>&lt;<code v-pre>void</code>&gt; | <code v-pre>void</code></p>
<p>Void or a promise if the machine is async</p>
<hr>
<h3 id="start" tabindex="-1"><a class="header-anchor" href="#start" aria-hidden="true">#</a> start</h3>
<p>▸ <strong>start</strong>(<code v-pre>machine</code>, <code v-pre>payload?</code>): <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise" target="_blank" rel="noopener noreferrer"><code v-pre>Promise</code></a>&lt;<code v-pre>void</code>&gt; | <code v-pre>void</code></p>
<h4 id="parameters-21" tabindex="-1"><a class="header-anchor" href="#parameters-21" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left">The machine to run the initial state arguments</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>payload?</code></td>
<td style="text-align:left"><code v-pre>any</code></td>
<td style="text-align:left">The optional payload to pass to the initial state</td>
</tr>
</tbody>
</table>
<h4 id="returns-21" tabindex="-1"><a class="header-anchor" href="#returns-21" aria-hidden="true">#</a> Returns</h4>
<p><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise" target="_blank" rel="noopener noreferrer"><code v-pre>Promise</code></a>&lt;<code v-pre>void</code>&gt; | <code v-pre>void</code></p>
<p>Void or a promise if the machine is async</p>
<hr>
<h2 id="state-functions-1" tabindex="-1"><a class="header-anchor" href="#state-functions-1" aria-hidden="true">#</a> State Functions</h2>
<h3 id="getstate" tabindex="-1"><a class="header-anchor" href="#getstate" aria-hidden="true">#</a> getState</h3>
<p>▸ <strong>getState</strong>(<code v-pre>machine</code>, <code v-pre>path?</code>): <RouterLink to="/api/interfaces/x_robot.AllStates.html"><code v-pre>AllStates</code></RouterLink> | <RouterLink to="/api/modules/x_robot.html#currentstate"><code v-pre>CurrentState</code></RouterLink></p>
<p>Get the current state or the parallel states of the machine if no path is provided
Or get the current state of a nested machine if a path is provided</p>
<h4 id="parameters-22" tabindex="-1"><a class="header-anchor" href="#parameters-22" aria-hidden="true">#</a> Parameters</h4>
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
<td style="text-align:left">The machine to get the current state of</td>
</tr>
<tr>
<td style="text-align:left"><code v-pre>path?</code></td>
<td style="text-align:left"><code v-pre>string</code></td>
<td style="text-align:left">The path to the current state, e.g. 'stateA.stateB.stateC'</td>
</tr>
</tbody>
</table>
<h4 id="returns-22" tabindex="-1"><a class="header-anchor" href="#returns-22" aria-hidden="true">#</a> Returns</h4>
<p><RouterLink to="/api/interfaces/x_robot.AllStates.html"><code v-pre>AllStates</code></RouterLink> | <RouterLink to="/api/modules/x_robot.html#currentstate"><code v-pre>CurrentState</code></RouterLink></p>
<p>The current state or null if the path is invalid</p>
<h2 id="type-aliases-1" tabindex="-1"><a class="header-anchor" href="#type-aliases-1" aria-hidden="true">#</a> Type Aliases</h2>
<h3 id="currentstate" tabindex="-1"><a class="header-anchor" href="#currentstate" aria-hidden="true">#</a> CurrentState</h3>
<p>Ƭ <strong>CurrentState</strong>: <code v-pre>string</code> | <code v-pre>null</code></p>
<h4 id="defined-in" tabindex="-1"><a class="header-anchor" href="#defined-in" aria-hidden="true">#</a> Defined in</h4>
<p><a href="https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/create.ts#L572" target="_blank" rel="noopener noreferrer">lib/machine/create.ts:572</a></p>
<h2 id="variables-1" tabindex="-1"><a class="header-anchor" href="#variables-1" aria-hidden="true">#</a> Variables</h2>
<h3 id="start-event" tabindex="-1"><a class="header-anchor" href="#start-event" aria-hidden="true">#</a> START_EVENT</h3>
<p>• <code v-pre>Const</code> <strong>START_EVENT</strong>: <code v-pre>&quot;__start__&quot;</code></p>
<h4 id="defined-in-1" tabindex="-1"><a class="header-anchor" href="#defined-in-1" aria-hidden="true">#</a> Defined in</h4>
<p><a href="https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L188" target="_blank" rel="noopener noreferrer">lib/machine/interfaces.ts:188</a></p>
</div></template>
