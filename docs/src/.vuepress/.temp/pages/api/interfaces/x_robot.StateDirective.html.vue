<template><div><p><RouterLink to="/api/">Api</RouterLink> / <RouterLink to="/api/modules/x_robot.html">x-robot</RouterLink> / StateDirective</p>
<h1 id="interface-statedirective" tabindex="-1"><a class="header-anchor" href="#interface-statedirective" aria-hidden="true">#</a> Interface: StateDirective</h1>
<p><RouterLink to="/api/modules/x_robot.html">x-robot</RouterLink>.StateDirective</p>
<h2 id="hierarchy" tabindex="-1"><a class="header-anchor" href="#hierarchy" aria-hidden="true">#</a> Hierarchy</h2>
<ul>
<li>
<p><strong><code v-pre>StateDirective</code></strong></p>
<p>↳ <RouterLink to="/api/interfaces/x_robot.InfoStateDirective.html"><code v-pre>InfoStateDirective</code></RouterLink></p>
<p>↳ <RouterLink to="/api/interfaces/x_robot.WarningStateDirective.html"><code v-pre>WarningStateDirective</code></RouterLink></p>
<p>↳ <RouterLink to="/api/interfaces/x_robot.DangerStateDirective.html"><code v-pre>DangerStateDirective</code></RouterLink></p>
<p>↳ <RouterLink to="/api/interfaces/x_robot.PrimaryStateDirective.html"><code v-pre>PrimaryStateDirective</code></RouterLink></p>
<p>↳ <RouterLink to="/api/interfaces/x_robot.SuccessStateDirective.html"><code v-pre>SuccessStateDirective</code></RouterLink></p>
</li>
</ul>
<h2 id="table-of-contents" tabindex="-1"><a class="header-anchor" href="#table-of-contents" aria-hidden="true">#</a> Table of contents</h2>
<h3 id="properties" tabindex="-1"><a class="header-anchor" href="#properties" aria-hidden="true">#</a> Properties</h3>
<ul>
<li><RouterLink to="/api/interfaces/x_robot.StateDirective.html#name">name</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.StateDirective.html#run">run</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.StateDirective.html#on">on</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.StateDirective.html#immediate">immediate</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.StateDirective.html#args">args</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.StateDirective.html#type">type</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.StateDirective.html#nested">nested</RouterLink></li>
<li><RouterLink to="/api/interfaces/x_robot.StateDirective.html#description">description</RouterLink></li>
</ul>
<h2 id="properties-1" tabindex="-1"><a class="header-anchor" href="#properties-1" aria-hidden="true">#</a> Properties</h2>
<h3 id="name" tabindex="-1"><a class="header-anchor" href="#name" aria-hidden="true">#</a> name</h3>
<p>• <strong>name</strong>: <code v-pre>string</code></p>
<h4 id="defined-in" tabindex="-1"><a class="header-anchor" href="#defined-in" aria-hidden="true">#</a> Defined in</h4>
<p><a href="https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L99" target="_blank" rel="noopener noreferrer">lib/machine/interfaces.ts:99</a></p>
<hr>
<h3 id="run" tabindex="-1"><a class="header-anchor" href="#run" aria-hidden="true">#</a> run</h3>
<p>• <strong>run</strong>: (<RouterLink to="/api/interfaces/x_robot.ProducerDirective.html"><code v-pre>ProducerDirective</code></RouterLink> | <RouterLink to="/api/interfaces/x_robot.ActionDirective.html"><code v-pre>ActionDirective</code></RouterLink>)[]</p>
<h4 id="defined-in-1" tabindex="-1"><a class="header-anchor" href="#defined-in-1" aria-hidden="true">#</a> Defined in</h4>
<p><a href="https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L100" target="_blank" rel="noopener noreferrer">lib/machine/interfaces.ts:100</a></p>
<hr>
<h3 id="on" tabindex="-1"><a class="header-anchor" href="#on" aria-hidden="true">#</a> on</h3>
<p>• <strong>on</strong>: <RouterLink to="/api/interfaces/x_robot.TransitionsDirective.html"><code v-pre>TransitionsDirective</code></RouterLink></p>
<h4 id="defined-in-2" tabindex="-1"><a class="header-anchor" href="#defined-in-2" aria-hidden="true">#</a> Defined in</h4>
<p><a href="https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L101" target="_blank" rel="noopener noreferrer">lib/machine/interfaces.ts:101</a></p>
<hr>
<h3 id="immediate" tabindex="-1"><a class="header-anchor" href="#immediate" aria-hidden="true">#</a> immediate</h3>
<p>• <strong>immediate</strong>: <RouterLink to="/api/interfaces/x_robot.ImmediateDirective.html"><code v-pre>ImmediateDirective</code></RouterLink>[]</p>
<h4 id="defined-in-3" tabindex="-1"><a class="header-anchor" href="#defined-in-3" aria-hidden="true">#</a> Defined in</h4>
<p><a href="https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L102" target="_blank" rel="noopener noreferrer">lib/machine/interfaces.ts:102</a></p>
<hr>
<h3 id="args" tabindex="-1"><a class="header-anchor" href="#args" aria-hidden="true">#</a> args</h3>
<p>• <strong>args</strong>: (<RouterLink to="/api/interfaces/x_robot.TransitionDirective.html"><code v-pre>TransitionDirective</code></RouterLink> | <RouterLink to="/api/interfaces/x_robot.ImmediateDirective.html"><code v-pre>ImmediateDirective</code></RouterLink> | <RouterLink to="/api/interfaces/x_robot.ProducerDirective.html"><code v-pre>ProducerDirective</code></RouterLink> | <RouterLink to="/api/interfaces/x_robot.ActionDirective.html"><code v-pre>ActionDirective</code></RouterLink> | <RouterLink to="/api/interfaces/x_robot.DescriptionDirective.html"><code v-pre>DescriptionDirective</code></RouterLink> | <RouterLink to="/api/interfaces/x_robot.NestedMachineDirective.html"><code v-pre>NestedMachineDirective</code></RouterLink>)[]</p>
<h4 id="defined-in-4" tabindex="-1"><a class="header-anchor" href="#defined-in-4" aria-hidden="true">#</a> Defined in</h4>
<p><a href="https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L103" target="_blank" rel="noopener noreferrer">lib/machine/interfaces.ts:103</a></p>
<hr>
<h3 id="type" tabindex="-1"><a class="header-anchor" href="#type" aria-hidden="true">#</a> type</h3>
<p>• <strong>type</strong>: <code v-pre>string</code></p>
<h4 id="defined-in-5" tabindex="-1"><a class="header-anchor" href="#defined-in-5" aria-hidden="true">#</a> Defined in</h4>
<p><a href="https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L111" target="_blank" rel="noopener noreferrer">lib/machine/interfaces.ts:111</a></p>
<hr>
<h3 id="nested" tabindex="-1"><a class="header-anchor" href="#nested" aria-hidden="true">#</a> nested</h3>
<p>• <strong>nested</strong>: <RouterLink to="/api/interfaces/x_robot.NestedMachineDirective.html"><code v-pre>NestedMachineDirective</code></RouterLink>[]</p>
<h4 id="defined-in-6" tabindex="-1"><a class="header-anchor" href="#defined-in-6" aria-hidden="true">#</a> Defined in</h4>
<p><a href="https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L112" target="_blank" rel="noopener noreferrer">lib/machine/interfaces.ts:112</a></p>
<hr>
<h3 id="description" tabindex="-1"><a class="header-anchor" href="#description" aria-hidden="true">#</a> description</h3>
<p>• <code v-pre>Optional</code> <strong>description</strong>: <code v-pre>string</code></p>
<h4 id="defined-in-7" tabindex="-1"><a class="header-anchor" href="#defined-in-7" aria-hidden="true">#</a> Defined in</h4>
<p><a href="https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L113" target="_blank" rel="noopener noreferrer">lib/machine/interfaces.ts:113</a></p>
</div></template>
