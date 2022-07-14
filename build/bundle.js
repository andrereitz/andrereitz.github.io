
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    class HtmlTag {
        constructor(is_svg = false) {
            this.is_svg = false;
            this.is_svg = is_svg;
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                if (this.is_svg)
                    this.e = svg_element(target.nodeName);
                else
                    this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const globalSizes = writable({
        heroH: null,
        navbarH: null
    });

    const filters = writable([]);

    const filterCategories = writable([]);

    const personalLinks = writable([]);

    const studies = writable([]);

    /* src/shared/LoaderSkeleton.svelte generated by Svelte v3.49.0 */

    const file$a = "src/shared/LoaderSkeleton.svelte";

    function create_fragment$a(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "loader-skeleton svelte-1l5u1d2");
    			attr_dev(div, "style", /*styles*/ ctx[0]);
    			add_location(div, file$a, 22, 0, 599);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*styles*/ 1) {
    				attr_dev(div, "style", /*styles*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let styles;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LoaderSkeleton', slots, []);
    	let { display = "inline-block" } = $$props;
    	let { maxWidth = '100px' } = $$props;
    	let { height = '25px' } = $$props;
    	let { borderRadius = '10px' } = $$props;
    	let { gradientColor = 'var(--color-gray-600)' } = $$props;
    	let { background = 'var(--color-gray-500)' } = $$props;
    	let { margin = '0' } = $$props;

    	const writable_props = [
    		'display',
    		'maxWidth',
    		'height',
    		'borderRadius',
    		'gradientColor',
    		'background',
    		'margin'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LoaderSkeleton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('display' in $$props) $$invalidate(1, display = $$props.display);
    		if ('maxWidth' in $$props) $$invalidate(2, maxWidth = $$props.maxWidth);
    		if ('height' in $$props) $$invalidate(3, height = $$props.height);
    		if ('borderRadius' in $$props) $$invalidate(4, borderRadius = $$props.borderRadius);
    		if ('gradientColor' in $$props) $$invalidate(5, gradientColor = $$props.gradientColor);
    		if ('background' in $$props) $$invalidate(6, background = $$props.background);
    		if ('margin' in $$props) $$invalidate(7, margin = $$props.margin);
    	};

    	$$self.$capture_state = () => ({
    		display,
    		maxWidth,
    		height,
    		borderRadius,
    		gradientColor,
    		background,
    		margin,
    		styles
    	});

    	$$self.$inject_state = $$props => {
    		if ('display' in $$props) $$invalidate(1, display = $$props.display);
    		if ('maxWidth' in $$props) $$invalidate(2, maxWidth = $$props.maxWidth);
    		if ('height' in $$props) $$invalidate(3, height = $$props.height);
    		if ('borderRadius' in $$props) $$invalidate(4, borderRadius = $$props.borderRadius);
    		if ('gradientColor' in $$props) $$invalidate(5, gradientColor = $$props.gradientColor);
    		if ('background' in $$props) $$invalidate(6, background = $$props.background);
    		if ('margin' in $$props) $$invalidate(7, margin = $$props.margin);
    		if ('styles' in $$props) $$invalidate(0, styles = $$props.styles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*display, maxWidth, height, borderRadius, margin, background, gradientColor*/ 254) {
    			$$invalidate(0, styles = `
        width: 100%;
        display: ${display};
        max-width: ${maxWidth};
        height: ${height};
        border-radius: ${borderRadius};
        margin: ${margin};

        --loader-background: ${background};
        --gradient-background: ${gradientColor};
    `);
    		}
    	};

    	return [
    		styles,
    		display,
    		maxWidth,
    		height,
    		borderRadius,
    		gradientColor,
    		background,
    		margin
    	];
    }

    class LoaderSkeleton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			display: 1,
    			maxWidth: 2,
    			height: 3,
    			borderRadius: 4,
    			gradientColor: 5,
    			background: 6,
    			margin: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoaderSkeleton",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get display() {
    		throw new Error("<LoaderSkeleton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set display(value) {
    		throw new Error("<LoaderSkeleton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxWidth() {
    		throw new Error("<LoaderSkeleton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxWidth(value) {
    		throw new Error("<LoaderSkeleton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<LoaderSkeleton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<LoaderSkeleton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borderRadius() {
    		throw new Error("<LoaderSkeleton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borderRadius(value) {
    		throw new Error("<LoaderSkeleton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gradientColor() {
    		throw new Error("<LoaderSkeleton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gradientColor(value) {
    		throw new Error("<LoaderSkeleton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get background() {
    		throw new Error("<LoaderSkeleton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set background(value) {
    		throw new Error("<LoaderSkeleton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get margin() {
    		throw new Error("<LoaderSkeleton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<LoaderSkeleton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const logo = `<svg class="logo" viewBox="0 0 330 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.0603 20.2412L8.33148 50H0L2.97553 44.4946L19.6385 12.8015H27.0773L44.0378 44.941L87.6293 47.7681L38.0868 50L23.0603 20.2412Z" fill="white"/>
<path d="M46.8646 42.1144V12.802H73.4955C75.5288 12.7028 79.5954 13.8436 79.5954 19.2002V26.1935C79.4962 27.8798 77.9588 31.6989 72.7517 31.2525L81.0831 42.1144H72.4541L64.8665 31.9964V26.1935H70.52C71.5912 26.1935 71.9582 25.3007 72.0078 24.8543V20.2417C72.0078 19.0514 71.0159 18.4562 70.52 18.3074H54.6009V26.1935V31.9964V42.1144H46.8646Z" fill="white"/>
<path d="M0 0L83.4035 7.5323L90.1585 47.3164V0H0Z" fill="white"/>
<path d="M124.716 10.3165H134.327L146.164 43.1493H138.172L135.238 34.4985H123.249L120.366 43.1493H112.576L124.716 10.3165ZM133.518 29.2371L129.37 16.8932H129.168L125.02 29.2371H133.518Z" fill="white"/>
<path d="M145.656 18.6638H150.209V21.6486C150.681 19.3215 153.362 18.1579 158.252 18.1579C161.388 18.1579 163.58 18.7313 164.828 19.878C166.109 20.9909 166.75 22.7616 166.75 25.1899V43.1493H162.197V25.4429C162.197 24.8021 162.147 24.2793 162.046 23.8746C161.945 23.4699 161.742 23.0651 161.439 22.6604C160.764 21.8172 159.264 21.3957 156.937 21.3957C155.149 21.3957 153.767 21.5306 152.789 21.8004C151.845 22.0365 151.17 22.4412 150.765 23.0145C150.395 23.5879 150.209 24.3973 150.209 25.4429V43.1493H145.656V18.6638Z" fill="white"/>
<path d="M178.852 43.6552C176.424 43.6552 174.518 43.4191 173.136 42.947C171.753 42.4411 170.742 41.6316 170.101 40.5187C169.494 39.4057 169.19 37.8542 169.19 35.8644V25.0887C169.19 22.6267 169.949 20.856 171.467 19.7768C173.018 18.6975 175.564 18.1579 179.105 18.1579C181.229 18.1579 183.05 18.4277 184.568 18.9674C186.119 19.507 186.912 20.2827 186.945 21.2945H187.046L186.945 15.0719V7.73639H191.498V43.1493H187.046V40.2657C187.046 41.1763 186.321 41.952 184.871 42.5928C183.421 43.3011 181.415 43.6552 178.852 43.6552ZM179.813 40.5187C182.342 40.5187 184.163 40.232 185.276 39.6586C186.389 39.0853 186.945 38.1072 186.945 36.7244V24.6334C186.945 22.4412 184.703 21.3451 180.218 21.3451C177.52 21.3451 175.766 21.5474 174.957 21.9522C174.114 22.3569 173.692 23.2506 173.692 24.6334V36.7244C173.692 38.1072 174.148 39.0853 175.058 39.6586C176.002 40.232 177.587 40.5187 179.813 40.5187Z" fill="white"/>
<path d="M194.446 18.6638H198.746V22.6604C198.746 21.8847 199.083 21.1596 199.758 20.485C200.432 19.7768 201.292 19.2203 202.337 18.8156C203.383 18.3771 204.411 18.1579 205.423 18.1579H207.649V22.0533H205.12C202.961 22.0533 201.393 22.34 200.415 22.9134C199.471 23.453 198.999 24.4479 198.999 25.8982V43.1493H194.446V18.6638Z" fill="white"/>
<path d="M217.947 43.6552C210.461 43.6552 206.717 41.1595 206.717 36.1679V26.5052C206.717 23.5373 207.56 21.4125 209.246 20.1309C210.966 18.8156 213.732 18.1579 217.542 18.1579C221.151 18.1579 223.747 18.7819 225.332 20.0297C226.951 21.2776 227.76 23.4361 227.76 26.5052V31.9184H211.32V35.6114C211.32 37.2978 211.911 38.5119 213.091 39.2539C214.271 39.9959 216.092 40.3669 218.554 40.3669C220.881 40.3669 223.629 39.9622 226.799 39.1527V42.6434C223.697 43.318 220.746 43.6552 217.947 43.6552ZM223.208 28.9336V25.0887C223.208 23.6048 222.752 22.593 221.842 22.0533C220.965 21.48 219.448 21.1933 217.289 21.1933C215.199 21.1933 213.681 21.48 212.737 22.0533C211.793 22.593 211.32 23.6048 211.32 25.0887V28.9336H223.208Z" fill="white"/>
<path d="M236.846 10.3165H251.617C256.001 10.3165 259.171 10.8561 261.127 11.9354C263.083 12.9809 264.061 14.7515 264.061 17.2473V23.0145C264.061 24.937 263.369 26.4547 261.987 27.5676C260.638 28.6469 258.834 29.3383 256.574 29.6418L266.084 43.1493H256.979L248.38 30.2489H244.737V43.1493H236.846V10.3165ZM251.516 25.0381C253.37 25.0381 254.635 24.8021 255.31 24.3299C255.984 23.824 256.321 22.8628 256.321 21.4463V19.1191C256.321 17.905 255.95 17.0787 255.208 16.6402C254.5 16.168 253.269 15.932 251.516 15.932H244.737V25.0381H251.516Z" fill="white"/>
<path d="M276.806 43.6552C269.32 43.6552 265.576 41.1595 265.576 36.1679V26.5052C265.576 23.5373 266.42 21.4125 268.106 20.1309C269.826 18.8156 272.591 18.1579 276.401 18.1579C280.01 18.1579 282.606 18.7819 284.191 20.0297C285.81 21.2776 286.619 23.4361 286.619 26.5052V31.9184H270.18V35.6114C270.18 37.2978 270.77 38.5119 271.95 39.2539C273.13 39.9959 274.951 40.3669 277.413 40.3669C279.74 40.3669 282.488 39.9622 285.658 39.1527V42.6434C282.556 43.318 279.605 43.6552 276.806 43.6552ZM282.067 28.9336V25.0887C282.067 23.6048 281.612 22.593 280.701 22.0533C279.824 21.48 278.307 21.1933 276.149 21.1933C274.058 21.1933 272.54 21.48 271.596 22.0533C270.652 22.593 270.18 23.6048 270.18 25.0887V28.9336H282.067Z" fill="white"/>
<path d="M289.005 9.81058H293.557V14.566H289.005V9.81058ZM289.005 18.6638H293.557V43.1493H289.005V18.6638Z" fill="white"/>
<path d="M307.169 43.6552C305.078 43.6552 303.443 43.436 302.263 42.9976C301.082 42.5254 300.222 41.7497 299.683 40.6704C299.177 39.5574 298.924 38.006 298.924 36.0161V21.6486H293.461V18.6638H298.924V11.0753H303.527V18.6638H312.278V21.6486H303.527V36.2691C303.527 37.4833 303.662 38.3939 303.932 39.001C304.235 39.608 304.741 40.0465 305.449 40.3163C306.191 40.5524 307.253 40.6704 308.636 40.6704C309.075 40.6704 310.289 40.5355 312.278 40.2657V43.2505C310.558 43.5203 308.855 43.6552 307.169 43.6552Z" fill="white"/>
<path d="M310.778 40.0633L324.537 21.7498H311.284V18.6638H329.696V21.7498L315.938 40.0633H330V43.1493H310.778V40.0633Z" fill="white"/>
</svg>`;

        const svelteLogo = `<svg enable-background="new 0 0 98.4 118.3" viewBox="0 0 98.4 118.3" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#ff3e00" stroke-width=".25"><path d="m92 15.7c-10.9-15.6-32.5-20.3-48.2-10.3l-27.5 17.5c-7.5 4.7-12.7 12.4-14.2 21.1-1.3 7.3-.2 14.8 3.3 21.3-2.4 3.6-4 7.6-4.7 11.8-1.6 8.9.5 18.1 5.7 25.4 11 15.7 32.6 20.3 48.2 10.4l27.5-17.5c7.5-4.7 12.7-12.4 14.2-21.1 1.3-7.3.2-14.8-3.3-21.3 2.4-3.6 4-7.6 4.7-11.8 1.7-9-.4-18.1-5.7-25.5"/><path d="m41.1 104c-8.9 2.3-18.2-1.2-23.4-8.7-3.2-4.4-4.4-9.9-3.5-15.3.2-.9.4-1.7.6-2.6l.5-1.6 1.4 1c3.3 2.4 6.9 4.2 10.8 5.4l1 .3-.1 1c-.1 1.4.3 2.9 1.1 4.1 1.6 2.3 4.4 3.4 7.1 2.7.6-.2 1.2-.4 1.7-.7l27.4-17.5c1.4-.9 2.3-2.2 2.6-3.8s-.1-3.3-1-4.6c-1.6-2.3-4.4-3.3-7.1-2.6-.6.2-1.2.4-1.7.7l-10.5 6.7c-1.7 1.1-3.6 1.9-5.6 2.4-8.9 2.3-18.2-1.2-23.4-8.7-3.1-4.4-4.4-9.9-3.4-15.3.9-5.2 4.1-9.9 8.6-12.7l27.4-17.5c1.7-1.1 3.6-1.9 5.6-2.5 8.9-2.3 18.2 1.2 23.4 8.7 3.2 4.4 4.4 9.9 3.5 15.3-.2.9-.4 1.7-.7 2.6l-.4 1.6-1.4-1c-3.3-2.4-6.9-4.2-10.8-5.4l-1-.3.1-1c.1-1.4-.3-2.9-1.1-4.1-1.6-2.3-4.4-3.3-7.1-2.6-.6.2-1.2.4-1.7.7l-27.4 17.5c-1.4.8-2.3 2.2-2.6 3.8s.1 3.3 1 4.6c1.6 2.3 4.4 3.3 7.1 2.6.6-.2 1.2-.4 1.7-.7l10.5-6.7c1.7-1.1 3.6-1.9 5.6-2.5 8.9-2.3 18.2 1.2 23.4 8.7 3.2 4.4 4.4 9.9 3.5 15.3-.9 5.2-4.1 9.9-8.6 12.7l-27.4 17.5c-1.8 1.1-3.7 2-5.7 2.5"/></g></svg>`;

    /* src/Hero.svelte generated by Svelte v3.49.0 */

    const { Error: Error_1$1 } = globals;
    const file$9 = "src/Hero.svelte";

    // (52:12) {:else}
    function create_else_block$2(ctx) {
    	let html_tag;
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(false);
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(/*heroHTML*/ ctx[2], target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*heroHTML*/ 4) html_tag.p(/*heroHTML*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(52:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (50:44) 
    function create_if_block_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("error loading");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(50:44) ",
    		ctx
    	});

    	return block;
    }

    // (40:12) {#if heroHTML === 'loading'}
    function create_if_block_1$2(ctx) {
    	let loaderskeleton0;
    	let t0;
    	let loaderskeleton1;
    	let t1;
    	let loaderskeleton2;
    	let t2;
    	let loaderskeleton3;
    	let t3;
    	let loaderskeleton4;
    	let t4;
    	let loaderskeleton5;
    	let t5;
    	let loaderskeleton6;
    	let t6;
    	let loaderskeleton7;
    	let current;

    	loaderskeleton0 = new LoaderSkeleton({
    			props: {
    				gradientColor: "#0F90C0",
    				background: "rgba(255,255,255,.1)",
    				display: "block",
    				maxWidth: "300px",
    				margin: "14px 0",
    				height: "28px"
    			},
    			$$inline: true
    		});

    	loaderskeleton1 = new LoaderSkeleton({
    			props: {
    				gradientColor: "#0F90C0",
    				background: "rgba(255,255,255,.1)",
    				display: "block",
    				maxWidth: "500px",
    				margin: "8px 0",
    				height: "22px"
    			},
    			$$inline: true
    		});

    	loaderskeleton2 = new LoaderSkeleton({
    			props: {
    				gradientColor: "#0F90C0",
    				background: "rgba(255,255,255,.1)",
    				display: "block",
    				maxWidth: "250px",
    				margin: "8px 0",
    				height: "22px"
    			},
    			$$inline: true
    		});

    	loaderskeleton3 = new LoaderSkeleton({
    			props: {
    				gradientColor: "#0F90C0",
    				background: "rgba(255,255,255,.1)",
    				display: "block",
    				maxWidth: "300px",
    				margin: "14px 0",
    				height: "28px"
    			},
    			$$inline: true
    		});

    	loaderskeleton4 = new LoaderSkeleton({
    			props: {
    				gradientColor: "#0F90C0",
    				background: "rgba(255,255,255,.1)",
    				display: "block",
    				maxWidth: "250px",
    				margin: "8px 0",
    				height: "22px"
    			},
    			$$inline: true
    		});

    	loaderskeleton5 = new LoaderSkeleton({
    			props: {
    				gradientColor: "#0F90C0",
    				background: "rgba(255,255,255,.1)",
    				display: "block",
    				maxWidth: "500px",
    				margin: "8px 0",
    				height: "22px"
    			},
    			$$inline: true
    		});

    	loaderskeleton6 = new LoaderSkeleton({
    			props: {
    				gradientColor: "#0F90C0",
    				background: "rgba(255,255,255,.1)",
    				display: "block",
    				maxWidth: "500px",
    				margin: "8px 0",
    				height: "22px"
    			},
    			$$inline: true
    		});

    	loaderskeleton7 = new LoaderSkeleton({
    			props: {
    				gradientColor: "#0F90C0",
    				background: "rgba(255,255,255,.1)",
    				display: "block",
    				maxWidth: "250px",
    				margin: "8px 0",
    				height: "22px"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(loaderskeleton0.$$.fragment);
    			t0 = space();
    			create_component(loaderskeleton1.$$.fragment);
    			t1 = space();
    			create_component(loaderskeleton2.$$.fragment);
    			t2 = space();
    			create_component(loaderskeleton3.$$.fragment);
    			t3 = space();
    			create_component(loaderskeleton4.$$.fragment);
    			t4 = space();
    			create_component(loaderskeleton5.$$.fragment);
    			t5 = space();
    			create_component(loaderskeleton6.$$.fragment);
    			t6 = space();
    			create_component(loaderskeleton7.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loaderskeleton0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(loaderskeleton1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(loaderskeleton2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(loaderskeleton3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(loaderskeleton4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(loaderskeleton5, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(loaderskeleton6, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(loaderskeleton7, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loaderskeleton0.$$.fragment, local);
    			transition_in(loaderskeleton1.$$.fragment, local);
    			transition_in(loaderskeleton2.$$.fragment, local);
    			transition_in(loaderskeleton3.$$.fragment, local);
    			transition_in(loaderskeleton4.$$.fragment, local);
    			transition_in(loaderskeleton5.$$.fragment, local);
    			transition_in(loaderskeleton6.$$.fragment, local);
    			transition_in(loaderskeleton7.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loaderskeleton0.$$.fragment, local);
    			transition_out(loaderskeleton1.$$.fragment, local);
    			transition_out(loaderskeleton2.$$.fragment, local);
    			transition_out(loaderskeleton3.$$.fragment, local);
    			transition_out(loaderskeleton4.$$.fragment, local);
    			transition_out(loaderskeleton5.$$.fragment, local);
    			transition_out(loaderskeleton6.$$.fragment, local);
    			transition_out(loaderskeleton7.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loaderskeleton0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(loaderskeleton1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(loaderskeleton2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(loaderskeleton3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(loaderskeleton4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(loaderskeleton5, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(loaderskeleton6, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(loaderskeleton7, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(40:12) {#if heroHTML === 'loading'}",
    		ctx
    	});

    	return block;
    }

    // (55:12) {#if windowW > 1024}
    function create_if_block$6(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "watermark fab fa-github svelte-1ojchga");
    			set_style(i, "opacity", 1 - Math.max(0, /*scrollY*/ ctx[1] / (/*$globalSizes*/ ctx[3].heroH - 100)));
    			set_style(i, "transform", "translate(0," + /*scrollY*/ ctx[1] * .2 + "px) rotate(" + (-25 - /*scrollY*/ ctx[1] / 50) + "deg)");
    			add_location(i, file$9, 55, 16, 2693);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*scrollY, $globalSizes*/ 10) {
    				set_style(i, "opacity", 1 - Math.max(0, /*scrollY*/ ctx[1] / (/*$globalSizes*/ ctx[3].heroH - 100)));
    			}

    			if (dirty & /*scrollY*/ 2) {
    				set_style(i, "transform", "translate(0," + /*scrollY*/ ctx[1] * .2 + "px) rotate(" + (-25 - /*scrollY*/ ctx[1] / 50) + "deg)");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(55:12) {#if windowW > 1024}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let div2;
    	let div1;
    	let header;
    	let span;
    	let t0;
    	let div0;
    	let current_block_type_index;
    	let if_block0;
    	let t1;
    	let div2_resize_listener;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[4]);
    	add_render_callback(/*onwindowscroll*/ ctx[5]);
    	const if_block_creators = [create_if_block_1$2, create_if_block_2$1, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*heroHTML*/ ctx[2] === 'loading') return 0;
    		if (/*heroHTML*/ ctx[2] === 'error') return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*windowW*/ ctx[0] > 1024 && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			header = element("header");
    			span = element("span");
    			t0 = space();
    			div0 = element("div");
    			if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(span, "class", "logo svelte-1ojchga");
    			set_style(span, "opacity", 1 - Math.max(0, /*scrollY*/ ctx[1] / 100));
    			set_style(span, "transform", "translate(0," + /*scrollY*/ ctx[1] * .4 + "px)");
    			add_location(span, file$9, 34, 12, 1037);
    			attr_dev(header, "class", "svelte-1ojchga");
    			add_location(header, file$9, 33, 8, 1016);
    			attr_dev(div0, "class", "content svelte-1ojchga");
    			add_location(div0, file$9, 38, 8, 1224);
    			attr_dev(div1, "class", "container");
    			add_location(div1, file$9, 32, 4, 984);
    			attr_dev(div2, "class", "row hero svelte-1ojchga");
    			add_render_callback(() => /*div2_elementresize_handler*/ ctx[6].call(div2));
    			add_location(div2, file$9, 31, 0, 918);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, header);
    			append_dev(header, span);
    			span.innerHTML = logo;
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div0, t1);
    			if (if_block1) if_block1.m(div0, null);
    			div2_resize_listener = add_resize_listener(div2, /*div2_elementresize_handler*/ ctx[6].bind(div2));
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "resize", /*onwindowresize*/ ctx[4]),
    					listen_dev(window, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[5]();
    					})
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*scrollY*/ 2 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*scrollY*/ ctx[1]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (!current || dirty & /*scrollY*/ 2) {
    				set_style(span, "opacity", 1 - Math.max(0, /*scrollY*/ ctx[1] / 100));
    			}

    			if (!current || dirty & /*scrollY*/ 2) {
    				set_style(span, "transform", "translate(0," + /*scrollY*/ ctx[1] * .4 + "px)");
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div0, t1);
    			}

    			if (/*windowW*/ ctx[0] > 1024) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$6(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    			div2_resize_listener();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $globalSizes;
    	validate_store(globalSizes, 'globalSizes');
    	component_subscribe($$self, globalSizes, $$value => $$invalidate(3, $globalSizes = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Hero', slots, []);
    	let windowW;
    	let scrollY;
    	let heroHTML = 'loading';

    	onMount(async () => {
    		try {
    			const response = await fetch('https://andrereitz.com.br/wp-json/reitz/studies/content');

    			if (response.ok) {
    				const data = await response.json();
    				$$invalidate(2, heroHTML = data.hero_content_raw);
    				filterCategories.set(data.filters);
    				personalLinks.set(data.links);
    			} else {
    				throw new Error(response.status + " Failed Fetch");
    			}
    		} catch(err) {
    			$$invalidate(2, heroHTML = 'error');
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Hero> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(0, windowW = window.innerWidth);
    	}

    	function onwindowscroll() {
    		$$invalidate(1, scrollY = window.pageYOffset);
    	}

    	function div2_elementresize_handler() {
    		$globalSizes.heroH = this.clientHeight;
    		globalSizes.set($globalSizes);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		globalSizes,
    		filterCategories,
    		personalLinks,
    		LoaderSkeleton,
    		logo,
    		windowW,
    		scrollY,
    		heroHTML,
    		$globalSizes
    	});

    	$$self.$inject_state = $$props => {
    		if ('windowW' in $$props) $$invalidate(0, windowW = $$props.windowW);
    		if ('scrollY' in $$props) $$invalidate(1, scrollY = $$props.scrollY);
    		if ('heroHTML' in $$props) $$invalidate(2, heroHTML = $$props.heroHTML);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		windowW,
    		scrollY,
    		heroHTML,
    		$globalSizes,
    		onwindowresize,
    		onwindowscroll,
    		div2_elementresize_handler
    	];
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hero",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quadInOut(t) {
        t /= 0.5;
        if (t < 1)
            return 0.5 * t * t;
        t--;
        return -0.5 * (t * (t - 2) - 1);
    }

    var _ = {
      $(selector) {
        if (typeof selector === "string") {
          return document.querySelector(selector);
        }
        return selector;
      },
      extend(...args) {
        return Object.assign(...args);
      },
      cumulativeOffset(element) {
        let top = 0;
        let left = 0;

        do {
          top += element.offsetTop || 0;
          left += element.offsetLeft || 0;
          element = element.offsetParent;
        } while (element);

        return {
          top: top,
          left: left
        };
      },
      directScroll(element) {
        return element && element !== document && element !== document.body;
      },
      scrollTop(element, value) {
        let inSetter = value !== undefined;
        if (this.directScroll(element)) {
          return inSetter ? (element.scrollTop = value) : element.scrollTop;
        } else {
          return inSetter
            ? (document.documentElement.scrollTop = document.body.scrollTop = value)
            : window.pageYOffset ||
                document.documentElement.scrollTop ||
                document.body.scrollTop ||
                0;
        }
      },
      scrollLeft(element, value) {
        let inSetter = value !== undefined;
        if (this.directScroll(element)) {
          return inSetter ? (element.scrollLeft = value) : element.scrollLeft;
        } else {
          return inSetter
            ? (document.documentElement.scrollLeft = document.body.scrollLeft = value)
            : window.pageXOffset ||
                document.documentElement.scrollLeft ||
                document.body.scrollLeft ||
                0;
        }
      }
    };

    const defaultOptions = {
      container: "body",
      duration: 500,
      delay: 0,
      offset: 0,
      easing: cubicInOut,
      onStart: noop,
      onDone: noop,
      onAborting: noop,
      scrollX: false,
      scrollY: true
    };

    const _scrollTo = options => {
      let {
        offset,
        duration,
        delay,
        easing,
        x=0,
        y=0,
        scrollX,
        scrollY,
        onStart,
        onDone,
        container,
        onAborting,
        element
      } = options;

      if (typeof offset === "function") {
        offset = offset();
      }

      var cumulativeOffsetContainer = _.cumulativeOffset(container);
      var cumulativeOffsetTarget = element
        ? _.cumulativeOffset(element)
        : { top: y, left: x };

      var initialX = _.scrollLeft(container);
      var initialY = _.scrollTop(container);

      var targetX =
        cumulativeOffsetTarget.left - cumulativeOffsetContainer.left + offset;
      var targetY =
        cumulativeOffsetTarget.top - cumulativeOffsetContainer.top + offset;

      var diffX = targetX - initialX;
    	var diffY = targetY - initialY;

      let scrolling = true;
      let started = false;
      let start_time = now() + delay;
      let end_time = start_time + duration;

      function scrollToTopLeft(element, top, left) {
        if (scrollX) _.scrollLeft(element, left);
        if (scrollY) _.scrollTop(element, top);
      }

      function start(delayStart) {
        if (!delayStart) {
          started = true;
          onStart(element, {x, y});
        }
      }

      function tick(progress) {
        scrollToTopLeft(
          container,
          initialY + diffY * progress,
          initialX + diffX * progress
        );
      }

      function stop() {
        scrolling = false;
      }

      loop(now => {
        if (!started && now >= start_time) {
          start(false);
        }

        if (started && now >= end_time) {
          tick(1);
          stop();
          onDone(element, {x, y});
        }

        if (!scrolling) {
          onAborting(element, {x, y});
          return false;
        }
        if (started) {
          const p = now - start_time;
          const t = 0 + 1 * easing(p / duration);
          tick(t);
        }

        return true;
      });

      start(delay);

      tick(0);

      return stop;
    };

    const proceedOptions = options => {
    	let opts = _.extend({}, defaultOptions, options);
      opts.container = _.$(opts.container);
      opts.element = _.$(opts.element);
      return opts;
    };

    const scrollContainerHeight = containerElement => {
      if (
        containerElement &&
        containerElement !== document &&
        containerElement !== document.body
      ) {
        return containerElement.scrollHeight - containerElement.offsetHeight;
      } else {
        let body = document.body;
        let html = document.documentElement;

        return Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight
        );
      }
    };

    const setGlobalOptions = options => {
    	_.extend(defaultOptions, options || {});
    };

    const scrollTo$1 = options => {
      return _scrollTo(proceedOptions(options));
    };

    const scrollToBottom = options => {
      options = proceedOptions(options);

      return _scrollTo(
        _.extend(options, {
          element: null,
          y: scrollContainerHeight(options.container)
        })
      );
    };

    const scrollToTop = options => {
      options = proceedOptions(options);

      return _scrollTo(
        _.extend(options, {
          element: null,
          y: 0
        })
      );
    };

    const makeScrollToAction = scrollToFunc => {
      return (node, options) => {
        let current = options;
        const handle = e => {
          e.preventDefault();
          scrollToFunc(
            typeof current === "string" ? { element: current } : current
          );
        };
        node.addEventListener("click", handle);
        node.addEventListener("touchstart", handle);
        return {
          update(options) {
            current = options;
          },
          destroy() {
            node.removeEventListener("click", handle);
            node.removeEventListener("touchstart", handle);
          }
        };
      };
    };

    const scrollto = makeScrollToAction(scrollTo$1);
    const scrolltotop = makeScrollToAction(scrollToTop);
    const scrolltobottom = makeScrollToAction(scrollToBottom);

    var animateScroll = /*#__PURE__*/Object.freeze({
        __proto__: null,
        setGlobalOptions: setGlobalOptions,
        scrollTo: scrollTo$1,
        scrollToBottom: scrollToBottom,
        scrollToTop: scrollToTop,
        makeScrollToAction: makeScrollToAction,
        scrollto: scrollto,
        scrolltotop: scrolltotop,
        scrolltobottom: scrolltobottom
    });

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* src/Nav.svelte generated by Svelte v3.49.0 */
    const file$8 = "src/Nav.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (60:8) { #if wSize < 768 }
    function create_if_block_1$1(ctx) {
    	let i;
    	let i_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "fas fa-bars menu-trigger svelte-1jundz2");
    			add_location(i, file$8, 60, 12, 1383);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!i_transition) i_transition = create_bidirectional_transition(i, fade, {}, true);
    				i_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!i_transition) i_transition = create_bidirectional_transition(i, fade, {}, false);
    			i_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching && i_transition) i_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(60:8) { #if wSize < 768 }",
    		ctx
    	});

    	return block;
    }

    // (65:16) { #if wSize >= 768 || menuOpen }
    function create_if_block$5(ctx) {
    	let li;
    	let t0_value = /*item*/ ctx[12].name + "";
    	let t0;
    	let t1;
    	let li_transition;
    	let current;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[10](/*item*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(li, "class", "svelte-1jundz2");
    			add_location(li, file$8, 65, 16, 1650);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!li_transition) li_transition = create_bidirectional_transition(
    					li,
    					fly,
    					{
    						y: -50,
    						duration: 300,
    						delay: 100 * /*i*/ ctx[14]
    					},
    					true
    				);

    				li_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!li_transition) li_transition = create_bidirectional_transition(
    				li,
    				fly,
    				{
    					y: -50,
    					duration: 300,
    					delay: 100 * /*i*/ ctx[14]
    				},
    				false
    			);

    			li_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (detaching && li_transition) li_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(65:16) { #if wSize >= 768 || menuOpen }",
    		ctx
    	});

    	return block;
    }

    // (64:12) { #each NAV_ITEMS as item, i }
    function create_each_block$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = (/*wSize*/ ctx[1] >= 768 || /*menuOpen*/ ctx[2]) && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*wSize*/ ctx[1] >= 768 || /*menuOpen*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*wSize, menuOpen*/ 6) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(64:12) { #each NAV_ITEMS as item, i }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let div;
    	let nav;
    	let t;
    	let ul;
    	let ul_class_value;
    	let nav_resize_listener;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[7]);
    	add_render_callback(/*onwindowresize*/ ctx[8]);
    	let if_block = /*wSize*/ ctx[1] < 768 && create_if_block_1$1(ctx);
    	let each_value = /*NAV_ITEMS*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			nav = element("nav");
    			if (if_block) if_block.c();
    			t = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", ul_class_value = "" + (null_to_empty(/*menuOpen*/ ctx[2] ? 'menu-open' : '') + " svelte-1jundz2"));
    			add_location(ul, file$8, 62, 8, 1497);
    			attr_dev(nav, "class", "container svelte-1jundz2");
    			add_render_callback(() => /*nav_elementresize_handler*/ ctx[11].call(nav));
    			add_location(nav, file$8, 58, 4, 1278);

    			attr_dev(div, "class", div_class_value = "row " + (/*scrollY*/ ctx[0] >= /*$globalSizes*/ ctx[3].heroH
    			? 'fixed'
    			: '') + " svelte-1jundz2");

    			add_location(div, file$8, 57, 0, 1209);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, nav);
    			if (if_block) if_block.m(nav, null);
    			append_dev(nav, t);
    			append_dev(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			nav_resize_listener = add_resize_listener(nav, /*nav_elementresize_handler*/ ctx[11].bind(nav));
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[7]();
    					}),
    					listen_dev(window, "resize", /*onwindowresize*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*scrollY*/ 1 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*scrollY*/ ctx[0]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (/*wSize*/ ctx[1] < 768) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*wSize*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(nav, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*customScroll, NAV_ITEMS, wSize, menuOpen*/ 86) {
    				each_value = /*NAV_ITEMS*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*menuOpen*/ 4 && ul_class_value !== (ul_class_value = "" + (null_to_empty(/*menuOpen*/ ctx[2] ? 'menu-open' : '') + " svelte-1jundz2"))) {
    				attr_dev(ul, "class", ul_class_value);
    			}

    			if (!current || dirty & /*scrollY, $globalSizes*/ 9 && div_class_value !== (div_class_value = "row " + (/*scrollY*/ ctx[0] >= /*$globalSizes*/ ctx[3].heroH
    			? 'fixed'
    			: '') + " svelte-1jundz2")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			nav_resize_listener();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $globalSizes;
    	validate_store(globalSizes, 'globalSizes');
    	component_subscribe($$self, globalSizes, $$value => $$invalidate(3, $globalSizes = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nav', slots, []);

    	const NAV_ITEMS = [
    		{ name: 'Back to Top ', element: 'top' },
    		{
    			name: 'Where to find me',
    			element: '#section-find'
    		},
    		{
    			name: 'My Studies',
    			element: '#section-studies'
    		},
    		{
    			name: 'About this project',
    			element: '#section-about'
    		}
    	];

    	let scrollY;
    	let wSize;
    	let menuOpen;
    	setGlobalOptions({ easing: quadInOut, duration: 800 });

    	function toggleMenu(e) {
    		$$invalidate(2, menuOpen = !menuOpen);
    	}

    	function customScroll(element) {
    		if (wSize < 768) {
    			toggleMenu();
    		}

    		if (element === 'top') {
    			scrollToTop();
    		} else {
    			scrollTo$1({ element, offset: -$globalSizes.navbarH });
    		}

    		return;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(0, scrollY = window.pageYOffset);
    	}

    	function onwindowresize() {
    		$$invalidate(1, wSize = window.innerWidth);
    	}

    	const click_handler = () => toggleMenu();
    	const click_handler_1 = item => customScroll(item.element);

    	function nav_elementresize_handler() {
    		$globalSizes.navbarH = this.clientHeight;
    		globalSizes.set($globalSizes);
    	}

    	$$self.$capture_state = () => ({
    		globalSizes,
    		animateScroll,
    		quadInOut,
    		fly,
    		fade,
    		NAV_ITEMS,
    		scrollY,
    		wSize,
    		menuOpen,
    		toggleMenu,
    		customScroll,
    		$globalSizes
    	});

    	$$self.$inject_state = $$props => {
    		if ('scrollY' in $$props) $$invalidate(0, scrollY = $$props.scrollY);
    		if ('wSize' in $$props) $$invalidate(1, wSize = $$props.wSize);
    		if ('menuOpen' in $$props) $$invalidate(2, menuOpen = $$props.menuOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		scrollY,
    		wSize,
    		menuOpen,
    		$globalSizes,
    		NAV_ITEMS,
    		toggleMenu,
    		customScroll,
    		onwindowscroll,
    		onwindowresize,
    		click_handler,
    		click_handler_1,
    		nav_elementresize_handler
    	];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/Section.svelte generated by Svelte v3.49.0 */

    const file$7 = "src/Section.svelte";
    const get_content_slot_changes = dirty => ({});
    const get_content_slot_context = ctx => ({});

    // (10:25) No content
    function fallback_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("No content");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(10:25) No content",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let div_id_value;
    	let current;
    	const content_slot_template = /*#slots*/ ctx[3].content;
    	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[2], get_content_slot_context);
    	const content_slot_or_fallback = content_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (content_slot_or_fallback) content_slot_or_fallback.c();
    			attr_dev(div, "class", "row section svelte-ogjm79");
    			attr_dev(div, "id", div_id_value = /*$$props*/ ctx[1].id);
    			set_style(div, "--prop-marginBottom", /*marginBottom*/ ctx[0] + "px");
    			add_location(div, file$7, 4, 0, 49);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (content_slot_or_fallback) {
    				content_slot_or_fallback.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (content_slot) {
    				if (content_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						content_slot,
    						content_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(content_slot_template, /*$$scope*/ ctx[2], dirty, get_content_slot_changes),
    						get_content_slot_context
    					);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 2 && div_id_value !== (div_id_value = /*$$props*/ ctx[1].id)) {
    				attr_dev(div, "id", div_id_value);
    			}

    			if (!current || dirty & /*marginBottom*/ 1) {
    				set_style(div, "--prop-marginBottom", /*marginBottom*/ ctx[0] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(content_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(content_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (content_slot_or_fallback) content_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Section', slots, ['content']);
    	let { marginBottom } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('marginBottom' in $$new_props) $$invalidate(0, marginBottom = $$new_props.marginBottom);
    		if ('$$scope' in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ marginBottom });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), $$new_props));
    		if ('marginBottom' in $$props) $$invalidate(0, marginBottom = $$new_props.marginBottom);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [marginBottom, $$props, $$scope, slots];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { marginBottom: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*marginBottom*/ ctx[0] === undefined && !('marginBottom' in props)) {
    			console.warn("<Section> was created without expected prop 'marginBottom'");
    		}
    	}

    	get marginBottom() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set marginBottom(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/sections/About.svelte generated by Svelte v3.49.0 */
    const file$6 = "src/sections/About.svelte";

    // (19:4) { #if windowW > 768 }
    function create_if_block$4(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "svelte-logo svelte-f0nmnh");
    			set_style(span, "transform", "rotate(" + /*scrollY*/ ctx[1] / 5 + "deg");
    			add_location(span, file$6, 19, 8, 830);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = svelteLogo;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*scrollY*/ 2) {
    				set_style(span, "transform", "rotate(" + /*scrollY*/ ctx[1] / 5 + "deg");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(19:4) { #if windowW > 768 }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let div1;
    	let div0;
    	let h2;
    	let span;
    	let t1;
    	let t2;
    	let p0;
    	let t3;
    	let a0;
    	let t5;
    	let t6;
    	let p1;
    	let t7;
    	let a1;
    	let t9;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[2]);
    	add_render_callback(/*onwindowscroll*/ ctx[3]);
    	let if_block = /*windowW*/ ctx[0] > 768 && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			span = element("span");
    			span.textContent = "About This";
    			t1 = text(" Project");
    			t2 = space();
    			p0 = element("p");
    			t3 = text("This project was made using ");
    			a0 = element("a");
    			a0.textContent = "Svelte";
    			t5 = text(" for studies porpouses.");
    			t6 = space();
    			p1 = element("p");
    			t7 = text("Svelte is a lighweight component framework. Instead of using techniques like virtual DOM diffing, Svelte writes code that surgically updates the DOM when the state of your app changes. Checkout Svelte ");
    			a1 = element("a");
    			a1.textContent = "introductory post";
    			t9 = space();
    			if (if_block) if_block.c();
    			attr_dev(span, "class", "font-light");
    			add_location(span, file$6, 10, 12, 218);
    			add_location(h2, file$6, 10, 8, 214);
    			attr_dev(a0, "href", "https://svelte.dev/");
    			attr_dev(a0, "rel", "nofollow, noopener");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "svelte-f0nmnh");
    			add_location(a0, file$6, 12, 40, 326);
    			attr_dev(p0, "class", "svelte-f0nmnh");
    			add_location(p0, file$6, 11, 8, 282);
    			attr_dev(a1, "href", "https://svelte.dev/blog/svelte-3-rethinking-reactivity");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "svelte-f0nmnh");
    			add_location(a1, file$6, 15, 213, 669);
    			attr_dev(p1, "class", "svelte-f0nmnh");
    			add_location(p1, file$6, 14, 8, 452);
    			attr_dev(div0, "class", "content svelte-f0nmnh");
    			add_location(div0, file$6, 9, 4, 184);
    			attr_dev(div1, "class", "container svelte-f0nmnh");
    			add_location(div1, file$6, 8, 0, 156);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(h2, span);
    			append_dev(h2, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p0);
    			append_dev(p0, t3);
    			append_dev(p0, a0);
    			append_dev(p0, t5);
    			append_dev(div0, t6);
    			append_dev(div0, p1);
    			append_dev(p1, t7);
    			append_dev(p1, a1);
    			append_dev(div1, t9);
    			if (if_block) if_block.m(div1, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "resize", /*onwindowresize*/ ctx[2]),
    					listen_dev(window, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[3]();
    					})
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*scrollY*/ 2 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*scrollY*/ ctx[1]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (/*windowW*/ ctx[0] > 768) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	let windowW, scrollY;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(0, windowW = window.innerWidth);
    	}

    	function onwindowscroll() {
    		$$invalidate(1, scrollY = window.pageYOffset);
    	}

    	$$self.$capture_state = () => ({ svelteLogo, windowW, scrollY });

    	$$self.$inject_state = $$props => {
    		if ('windowW' in $$props) $$invalidate(0, windowW = $$props.windowW);
    		if ('scrollY' in $$props) $$invalidate(1, scrollY = $$props.scrollY);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [windowW, scrollY, onwindowresize, onwindowscroll];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/PeronalLink.svelte generated by Svelte v3.49.0 */

    const { console: console_1$2 } = globals;
    const file$5 = "src/PeronalLink.svelte";

    // (8:4) { #if link.iconClass }
    function create_if_block$3(ctx) {
    	let i;
    	let i_class_value;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*link*/ ctx[0].iconClass) + " svelte-1e2j0cg"));
    			add_location(i, file$5, 8, 8, 222);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*link*/ 1 && i_class_value !== (i_class_value = "" + (null_to_empty(/*link*/ ctx[0].iconClass) + " svelte-1e2j0cg"))) {
    				attr_dev(i, "class", i_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(8:4) { #if link.iconClass }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let a;
    	let t0;
    	let span;
    	let t1_value = /*link*/ ctx[0].title + "";
    	let t1;
    	let a_href_value;
    	let if_block = /*link*/ ctx[0].iconClass && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (if_block) if_block.c();
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			attr_dev(span, "class", "svelte-1e2j0cg");
    			add_location(span, file$5, 10, 4, 272);
    			attr_dev(a, "href", a_href_value = /*link*/ ctx[0].url);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "nofollow");
    			attr_dev(a, "class", "link svelte-1e2j0cg");
    			set_style(a, "--color-accent", /*link*/ ctx[0].accent);
    			add_location(a, file$5, 6, 0, 83);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			if (if_block) if_block.m(a, null);
    			append_dev(a, t0);
    			append_dev(a, span);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*link*/ ctx[0].iconClass) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(a, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*link*/ 1 && t1_value !== (t1_value = /*link*/ ctx[0].title + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*link*/ 1 && a_href_value !== (a_href_value = /*link*/ ctx[0].url)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*link*/ 1) {
    				set_style(a, "--color-accent", /*link*/ ctx[0].accent);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PeronalLink', slots, []);
    	let { link } = $$props;
    	const writable_props = ['link'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<PeronalLink> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('link' in $$props) $$invalidate(0, link = $$props.link);
    	};

    	$$self.$capture_state = () => ({ link });

    	$$self.$inject_state = $$props => {
    		if ('link' in $$props) $$invalidate(0, link = $$props.link);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*link*/ 1) {
    			console.log('### the link', link);
    		}
    	};

    	return [link];
    }

    class PeronalLink extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { link: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PeronalLink",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*link*/ ctx[0] === undefined && !('link' in props)) {
    			console_1$2.warn("<PeronalLink> was created without expected prop 'link'");
    		}
    	}

    	get link() {
    		throw new Error("<PeronalLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<PeronalLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/sections/Find.svelte generated by Svelte v3.49.0 */

    const { console: console_1$1 } = globals;
    const file$4 = "src/sections/Find.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (18:4) { :else }
    function create_else_block$1(ctx) {
    	let loaderskeleton0;
    	let t0;
    	let loaderskeleton1;
    	let t1;
    	let loaderskeleton2;
    	let current;

    	loaderskeleton0 = new LoaderSkeleton({
    			props: {
    				display: "inline-flex",
    				maxWidth: "150px",
    				height: "32px",
    				borderRadius: "300px"
    			},
    			$$inline: true
    		});

    	loaderskeleton1 = new LoaderSkeleton({
    			props: {
    				display: "inline-flex",
    				maxWidth: "150px",
    				height: "32px",
    				borderRadius: "300px"
    			},
    			$$inline: true
    		});

    	loaderskeleton2 = new LoaderSkeleton({
    			props: {
    				display: "inline-flex",
    				maxWidth: "150px",
    				height: "32px",
    				borderRadius: "300px"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(loaderskeleton0.$$.fragment);
    			t0 = space();
    			create_component(loaderskeleton1.$$.fragment);
    			t1 = space();
    			create_component(loaderskeleton2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loaderskeleton0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(loaderskeleton1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(loaderskeleton2, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loaderskeleton0.$$.fragment, local);
    			transition_in(loaderskeleton1.$$.fragment, local);
    			transition_in(loaderskeleton2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loaderskeleton0.$$.fragment, local);
    			transition_out(loaderskeleton1.$$.fragment, local);
    			transition_out(loaderskeleton2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loaderskeleton0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(loaderskeleton1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(loaderskeleton2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(18:4) { :else }",
    		ctx
    	});

    	return block;
    }

    // (14:4) { #if $personalLinks.length > 0 }
    function create_if_block$2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*$personalLinks*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$personalLinks*/ 1) {
    				each_value = /*$personalLinks*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(14:4) { #if $personalLinks.length > 0 }",
    		ctx
    	});

    	return block;
    }

    // (15:8) { #each $personalLinks as link }
    function create_each_block$2(ctx) {
    	let peronallink;
    	let current;

    	peronallink = new PeronalLink({
    			props: { link: /*link*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(peronallink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(peronallink, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const peronallink_changes = {};
    			if (dirty & /*$personalLinks*/ 1) peronallink_changes.link = /*link*/ ctx[4];
    			peronallink.$set(peronallink_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(peronallink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(peronallink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(peronallink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(15:8) { #each $personalLinks as link }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let div;
    	let h2;
    	let span;
    	let t1;
    	let t2;
    	let current_block_type_index;
    	let if_block;
    	let div_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[3]);
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$personalLinks*/ ctx[0].length > 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			span = element("span");
    			span.textContent = "Where to";
    			t1 = text(" Find Me");
    			t2 = space();
    			if_block.c();
    			attr_dev(span, "class", "font-light");
    			add_location(span, file$4, 12, 8, 433);
    			attr_dev(h2, "class", "svelte-1vvixw7");
    			add_location(h2, file$4, 12, 4, 429);
    			attr_dev(div, "class", "container");

    			attr_dev(div, "style", div_style_value = /*scrollY*/ ctx[1] >= /*$globalSizes*/ ctx[2].heroH
    			? `margin-top: ${/*$globalSizes*/ ctx[2].navbarH}px`
    			: '');

    			add_location(div, file$4, 11, 0, 316);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, span);
    			append_dev(h2, t1);
    			append_dev(div, t2);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "scroll", () => {
    					scrolling = true;
    					clearTimeout(scrolling_timeout);
    					scrolling_timeout = setTimeout(clear_scrolling, 100);
    					/*onwindowscroll*/ ctx[3]();
    				});

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*scrollY*/ 2 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*scrollY*/ ctx[1]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}

    			if (!current || dirty & /*scrollY, $globalSizes*/ 6 && div_style_value !== (div_style_value = /*scrollY*/ ctx[1] >= /*$globalSizes*/ ctx[2].heroH
    			? `margin-top: ${/*$globalSizes*/ ctx[2].navbarH}px`
    			: '')) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $personalLinks;
    	let $globalSizes;
    	validate_store(personalLinks, 'personalLinks');
    	component_subscribe($$self, personalLinks, $$value => $$invalidate(0, $personalLinks = $$value));
    	validate_store(globalSizes, 'globalSizes');
    	component_subscribe($$self, globalSizes, $$value => $$invalidate(2, $globalSizes = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Find', slots, []);
    	let scrollY;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Find> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(1, scrollY = window.pageYOffset);
    	}

    	$$self.$capture_state = () => ({
    		globalSizes,
    		personalLinks,
    		LoaderSkeleton,
    		PeronalLink,
    		scrollY,
    		$personalLinks,
    		$globalSizes
    	});

    	$$self.$inject_state = $$props => {
    		if ('scrollY' in $$props) $$invalidate(1, scrollY = $$props.scrollY);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$personalLinks*/ 1) {
    			console.log('### personal links', $personalLinks);
    		}
    	};

    	return [$personalLinks, scrollY, $globalSizes, onwindowscroll];
    }

    class Find extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Find",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Study.svelte generated by Svelte v3.49.0 */
    const file$3 = "src/Study.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (12:8) { #each study.technologies as tech, i }
    function create_each_block$1(ctx) {
    	let li;
    	let t_value = /*tech*/ ctx[1].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "svelte-5ipavr");
    			add_location(li, file$3, 12, 12, 387);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*study*/ 1 && t_value !== (t_value = /*tech*/ ctx[1].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(12:8) { #each study.technologies as tech, i }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let a;
    	let div;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let h3;
    	let t1_value = /*study*/ ctx[0].title + "";
    	let t1;
    	let t2;
    	let ul;
    	let t3;
    	let p;
    	let t4_value = /*study*/ ctx[0].description + "";
    	let t4;
    	let a_href_value;
    	let a_data_id_value;
    	let a_transition;
    	let current;
    	let each_value = /*study*/ ctx[0].technologies;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			p = element("p");
    			t4 = text(t4_value);
    			if (!src_url_equal(img.src, img_src_value = /*study*/ ctx[0].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*study*/ ctx[0].title);
    			attr_dev(img, "class", "svelte-5ipavr");
    			add_location(img, file$3, 7, 8, 230);
    			attr_dev(div, "class", "img svelte-5ipavr");
    			add_location(div, file$3, 6, 4, 204);
    			attr_dev(h3, "class", "svelte-5ipavr");
    			add_location(h3, file$3, 9, 4, 295);
    			attr_dev(ul, "class", "svelte-5ipavr");
    			add_location(ul, file$3, 10, 4, 322);
    			attr_dev(p, "class", "svelte-5ipavr");
    			add_location(p, file$3, 15, 4, 440);
    			attr_dev(a, "href", a_href_value = /*study*/ ctx[0].url);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "study svelte-5ipavr");
    			attr_dev(a, "data-id", a_data_id_value = /*study*/ ctx[0].id);
    			add_location(a, file$3, 5, 0, 89);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div);
    			append_dev(div, img);
    			append_dev(a, t0);
    			append_dev(a, h3);
    			append_dev(h3, t1);
    			append_dev(a, t2);
    			append_dev(a, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(a, t3);
    			append_dev(a, p);
    			append_dev(p, t4);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*study*/ 1 && !src_url_equal(img.src, img_src_value = /*study*/ ctx[0].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*study*/ 1 && img_alt_value !== (img_alt_value = /*study*/ ctx[0].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if ((!current || dirty & /*study*/ 1) && t1_value !== (t1_value = /*study*/ ctx[0].title + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*study*/ 1) {
    				each_value = /*study*/ ctx[0].technologies;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if ((!current || dirty & /*study*/ 1) && t4_value !== (t4_value = /*study*/ ctx[0].description + "")) set_data_dev(t4, t4_value);

    			if (!current || dirty & /*study*/ 1 && a_href_value !== (a_href_value = /*study*/ ctx[0].url)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (!current || dirty & /*study*/ 1 && a_data_id_value !== (a_data_id_value = /*study*/ ctx[0].id)) {
    				attr_dev(a, "data-id", a_data_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!a_transition) a_transition = create_bidirectional_transition(a, scale, { duration: 200 }, true);
    				a_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!a_transition) a_transition = create_bidirectional_transition(a, scale, { duration: 200 }, false);
    			a_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			destroy_each(each_blocks, detaching);
    			if (detaching && a_transition) a_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Study', slots, []);
    	let { study } = $$props;
    	const writable_props = ['study'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Study> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('study' in $$props) $$invalidate(0, study = $$props.study);
    	};

    	$$self.$capture_state = () => ({ scale, study });

    	$$self.$inject_state = $$props => {
    		if ('study' in $$props) $$invalidate(0, study = $$props.study);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [study];
    }

    class Study extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { study: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Study",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*study*/ ctx[0] === undefined && !('study' in props)) {
    			console.warn("<Study> was created without expected prop 'study'");
    		}
    	}

    	get study() {
    		throw new Error("<Study>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set study(value) {
    		throw new Error("<Study>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/Loader.svelte generated by Svelte v3.49.0 */

    const file$2 = "src/shared/Loader.svelte";

    // (12:4) {#if text}
    function create_if_block$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*text*/ ctx[0]);
    			attr_dev(div, "class", "text svelte-2nnc2j");
    			add_location(div, file$2, 12, 8, 442);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 1) set_data_dev(t, /*text*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(12:4) {#if text}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let div1_style_value;
    	let if_block = /*text*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "spinner svelte-2nnc2j");
    			set_style(div0, "background", /*gradientString*/ ctx[3], false);
    			add_location(div0, file$2, 10, 4, 357);
    			attr_dev(div1, "class", "loader svelte-2nnc2j");
    			attr_dev(div1, "style", div1_style_value = /*centered*/ ctx[1] ? 'justify-content: center' : '');
    			set_style(div1, "padding", /*padding*/ ctx[2], false);
    			add_location(div1, file$2, 9, 0, 256);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t);
    			if (if_block) if_block.m(div1, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*gradientString*/ 8) {
    				set_style(div0, "background", /*gradientString*/ ctx[3], false);
    			}

    			if (/*text*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*centered*/ 2 && div1_style_value !== (div1_style_value = /*centered*/ ctx[1] ? 'justify-content: center' : '')) {
    				attr_dev(div1, "style", div1_style_value);
    			}

    			if (dirty & /*padding*/ 4) {
    				set_style(div1, "padding", /*padding*/ ctx[2], false);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let gradientString;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Loader', slots, []);
    	let { text } = $$props;
    	let { centered } = $$props;
    	let { spinnerBg = 'rgba(157, 52, 206, 1)' } = $$props;
    	let { padding = '0' } = $$props;
    	const writable_props = ['text', 'centered', 'spinnerBg', 'padding'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Loader> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('centered' in $$props) $$invalidate(1, centered = $$props.centered);
    		if ('spinnerBg' in $$props) $$invalidate(4, spinnerBg = $$props.spinnerBg);
    		if ('padding' in $$props) $$invalidate(2, padding = $$props.padding);
    	};

    	$$self.$capture_state = () => ({
    		text,
    		centered,
    		spinnerBg,
    		padding,
    		gradientString
    	});

    	$$self.$inject_state = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('centered' in $$props) $$invalidate(1, centered = $$props.centered);
    		if ('spinnerBg' in $$props) $$invalidate(4, spinnerBg = $$props.spinnerBg);
    		if ('padding' in $$props) $$invalidate(2, padding = $$props.padding);
    		if ('gradientString' in $$props) $$invalidate(3, gradientString = $$props.gradientString);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*spinnerBg*/ 16) {
    			$$invalidate(3, gradientString = `conic-gradient(from 154deg at 50% 50%, rgba(0, 0, 0, 0) 34%, ${spinnerBg} 100%)`);
    		}
    	};

    	return [text, centered, padding, gradientString, spinnerBg];
    }

    class Loader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			text: 0,
    			centered: 1,
    			spinnerBg: 4,
    			padding: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loader",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*text*/ ctx[0] === undefined && !('text' in props)) {
    			console.warn("<Loader> was created without expected prop 'text'");
    		}

    		if (/*centered*/ ctx[1] === undefined && !('centered' in props)) {
    			console.warn("<Loader> was created without expected prop 'centered'");
    		}
    	}

    	get text() {
    		throw new Error("<Loader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Loader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centered() {
    		throw new Error("<Loader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centered(value) {
    		throw new Error("<Loader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spinnerBg() {
    		throw new Error("<Loader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spinnerBg(value) {
    		throw new Error("<Loader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get padding() {
    		throw new Error("<Loader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set padding(value) {
    		throw new Error("<Loader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function flip(node, { from, to }, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
        const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
        const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
            easing,
            css: (t, u) => {
                const x = u * dx;
                const y = u * dy;
                const sx = t + u * from.width / to.width;
                const sy = t + u * from.height / to.height;
                return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
            }
        };
    }

    /* src/sections/Studies.svelte generated by Svelte v3.49.0 */

    const { Error: Error_1, console: console_1 } = globals;
    const file$1 = "src/sections/Studies.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (85:8) {:else}
    function create_else_block_1(ctx) {
    	let loader;
    	let current;

    	loader = new Loader({
    			props: { text: "Loading filters" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(loader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loader, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(85:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (72:8) {#if $filterCategories.length > 0}
    function create_if_block_1(ctx) {
    	let h4;
    	let t;
    	let ul;

    	function select_block_type_1(ctx, dirty) {
    		if (/*$filters*/ ctx[0].length === 0) return create_if_block_2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value_1 = /*$filterCategories*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			if_block.c();
    			t = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h4, "class", "svelte-oq1ziy");
    			add_location(h4, file$1, 72, 8, 1939);
    			attr_dev(ul, "class", "filter svelte-oq1ziy");
    			add_location(ul, file$1, 79, 12, 2156);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			if_block.m(h4, null);
    			insert_dev(target, t, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(h4, null);
    				}
    			}

    			if (dirty & /*$filterCategories, $filters, handleFilter*/ 13) {
    				each_value_1 = /*$filterCategories*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if_block.d();
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(72:8) {#if $filterCategories.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (76:12) { :else }
    function create_else_block(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Clear filters";
    			attr_dev(span, "class", "svelte-oq1ziy");
    			add_location(span, file$1, 76, 16, 2048);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(76:12) { :else }",
    		ctx
    	});

    	return block;
    }

    // (74:12) { #if $filters.length === 0 }
    function create_if_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Filter:");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(74:12) { #if $filters.length === 0 }",
    		ctx
    	});

    	return block;
    }

    // (81:16) { #each $filterCategories as cat }
    function create_each_block_1(ctx) {
    	let li;
    	let t_value = /*cat*/ ctx[12].name + "";
    	let t;
    	let li_data_filter_value;
    	let li_class_value;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[5](/*cat*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "data-filter", li_data_filter_value = /*cat*/ ctx[12].name);

    			attr_dev(li, "class", li_class_value = "" + (null_to_empty(/*$filters*/ ctx[0].includes(/*cat*/ ctx[12].name)
    			? 'active'
    			: '') + " svelte-oq1ziy"));

    			add_location(li, file$1, 81, 20, 2247);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$filterCategories*/ 4 && t_value !== (t_value = /*cat*/ ctx[12].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*$filterCategories*/ 4 && li_data_filter_value !== (li_data_filter_value = /*cat*/ ctx[12].name)) {
    				attr_dev(li, "data-filter", li_data_filter_value);
    			}

    			if (dirty & /*$filters, $filterCategories*/ 5 && li_class_value !== (li_class_value = "" + (null_to_empty(/*$filters*/ ctx[0].includes(/*cat*/ ctx[12].name)
    			? 'active'
    			: '') + " svelte-oq1ziy"))) {
    				attr_dev(li, "class", li_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(81:16) { #each $filterCategories as cat }",
    		ctx
    	});

    	return block;
    }

    // (90:8) { #each $studies.filter( s => s.show == true) as study (study.id) }
    function create_each_block(key_1, ctx) {
    	let div;
    	let study;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	study = new Study({
    			props: { study: /*study*/ ctx[9] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(study.$$.fragment);
    			attr_dev(div, "class", "study-container svelte-oq1ziy");
    			add_location(div, file$1, 90, 12, 2639);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(study, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const study_changes = {};
    			if (dirty & /*$studies*/ 2) study_changes.study = /*study*/ ctx[9];
    			study.$set(study_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: DURATION });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(study.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(study.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(study);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(90:8) { #each $studies.filter( s => s.show == true) as study (study.id) }",
    		ctx
    	});

    	return block;
    }

    // (95:8) {#if $studies.filter( s => s.show == true).length === 0 && $filterCategories.length > 0}
    function create_if_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("No study with selected filters");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(95:8) {#if $studies.filter( s => s.show == true).length === 0 && $filterCategories.length > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let h2;
    	let span;
    	let t1;
    	let t2;
    	let div0;
    	let current_block_type_index;
    	let if_block0;
    	let t3;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t4;
    	let show_if = /*$studies*/ ctx[1].filter(func).length === 0 && /*$filterCategories*/ ctx[2].length > 0;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$filterCategories*/ ctx[2].length > 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let each_value = /*$studies*/ ctx[1].filter(func_1);
    	validate_each_argument(each_value);
    	const get_key = ctx => /*study*/ ctx[9].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	let if_block1 = show_if && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h2 = element("h2");
    			span = element("span");
    			span.textContent = "My";
    			t1 = text(" Studies");
    			t2 = space();
    			div0 = element("div");
    			if_block0.c();
    			t3 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(span, "class", "font-light");
    			add_location(span, file$1, 69, 8, 1811);
    			add_location(h2, file$1, 69, 4, 1807);
    			attr_dev(div0, "class", "filter-nav svelte-oq1ziy");
    			add_location(div0, file$1, 70, 4, 1863);
    			attr_dev(div1, "class", "studies svelte-oq1ziy");
    			add_location(div1, file$1, 88, 4, 2529);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$1, 68, 0, 1779);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h2);
    			append_dev(h2, span);
    			append_dev(h2, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div2, t3);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t4);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div0, null);
    			}

    			if (dirty & /*$studies*/ 2) {
    				each_value = /*$studies*/ ctx[1].filter(func_1);
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, fix_and_outro_and_destroy_block, create_each_block, t4, get_each_context);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}

    			if (dirty & /*$studies, $filterCategories*/ 6) show_if = /*$studies*/ ctx[1].filter(func).length === 0 && /*$filterCategories*/ ctx[2].length > 0;

    			if (show_if) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_blocks[current_block_type_index].d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const DURATION = 300;
    const func = s => s.show == true;
    const func_1 = s => s.show == true;

    function instance$1($$self, $$props, $$invalidate) {
    	let $filters;
    	let $studies;
    	let $filterCategories;
    	validate_store(filters, 'filters');
    	component_subscribe($$self, filters, $$value => $$invalidate(0, $filters = $$value));
    	validate_store(studies, 'studies');
    	component_subscribe($$self, studies, $$value => $$invalidate(1, $studies = $$value));
    	validate_store(filterCategories, 'filterCategories');
    	component_subscribe($$self, filterCategories, $$value => $$invalidate(2, $filterCategories = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Studies', slots, []);
    	let animating = false;

    	function handleFilter(cat) {
    		if (animating) return;

    		if ($filters.includes(cat)) {
    			set_store_value(
    				filters,
    				$filters = $filters.filter(f => {
    					return f !== cat;
    				}),
    				$filters
    			);
    		} else {
    			set_store_value(filters, $filters = [...$filters, cat], $filters);
    		}
    	}

    	function clickBlock() {
    		animating = true;
    		setTimeout(() => animating = false, DURATION);
    	}

    	function checkFilters($filters) {
    		clickBlock();
    		let tempStudies = $studies;

    		tempStudies.map(s => {
    			if ($filters.length === 0) return s.show = true;
    			let hasOne = false;

    			for (let i = 0; i < s.technologies.length; i++) {
    				if ($filters.includes(s.technologies[i].name)) {
    					hasOne = true;
    					break;
    				}
    			}

    			if (hasOne) return s.show = true;
    			return s.show = false;
    		});

    		set_store_value(studies, $studies = tempStudies, $studies);
    	}

    	onMount(async () => {
    		try {
    			const response = await fetch('https://andrereitz.com.br/wp-json/reitz/studies');

    			if (response.ok) {
    				const data = await response.json();
    				studies.set(data.map(d => ({ ...d, show: true })));
    			} else {
    				throw new Error(response.status + " Failed Fetch");
    			}
    		} catch(err) {
    			console.log('Error: ', err);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Studies> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => set_store_value(filters, $filters = [], $filters);
    	const click_handler_1 = cat => handleFilter(cat.name);

    	$$self.$capture_state = () => ({
    		filters,
    		studies,
    		filterCategories,
    		Study,
    		Loader,
    		flip,
    		onMount,
    		animating,
    		DURATION,
    		handleFilter,
    		clickBlock,
    		checkFilters,
    		$filters,
    		$studies,
    		$filterCategories
    	});

    	$$self.$inject_state = $$props => {
    		if ('animating' in $$props) animating = $$props.animating;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$filters*/ 1) {
    			checkFilters($filters);
    		}
    	};

    	return [
    		$filters,
    		$studies,
    		$filterCategories,
    		handleFilter,
    		click_handler,
    		click_handler_1
    	];
    }

    class Studies extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Studies",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.49.0 */
    const file = "src/App.svelte";

    // (12:2) <svelte:fragment slot="content">
    function create_content_slot_2(ctx) {
    	let find;
    	let current;
    	find = new Find({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(find.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(find, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(find.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(find.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(find, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_2.name,
    		type: "slot",
    		source: "(12:2) <svelte:fragment slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:2) <svelte:fragment slot="content">
    function create_content_slot_1(ctx) {
    	let studies;
    	let current;
    	studies = new Studies({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(studies.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(studies, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(studies.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(studies.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(studies, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_1.name,
    		type: "slot",
    		source: "(17:2) <svelte:fragment slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (22:2) <svelte:fragment slot="content">
    function create_content_slot(ctx) {
    	let about;
    	let current;
    	about = new About({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(about.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(about, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(about.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(about.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(about, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot.name,
    		type: "slot",
    		source: "(22:2) <svelte:fragment slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let hero;
    	let t0;
    	let nav;
    	let t1;
    	let section0;
    	let t2;
    	let section1;
    	let t3;
    	let section2;
    	let current;

    	hero = new Hero({
    			props: { test: "this is var" },
    			$$inline: true
    		});

    	nav = new Nav({ $$inline: true });

    	section0 = new Section({
    			props: {
    				id: "section-find",
    				$$slots: { content: [create_content_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section1 = new Section({
    			props: {
    				id: "section-studies",
    				$$slots: { content: [create_content_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section2 = new Section({
    			props: {
    				id: "section-about",
    				marginBottom: "150",
    				$$slots: { content: [create_content_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(hero.$$.fragment);
    			t0 = space();
    			create_component(nav.$$.fragment);
    			t1 = space();
    			create_component(section0.$$.fragment);
    			t2 = space();
    			create_component(section1.$$.fragment);
    			t3 = space();
    			create_component(section2.$$.fragment);
    			attr_dev(main, "class", "svelte-ftf5xh");
    			add_location(main, file, 7, 0, 181);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(hero, main, null);
    			append_dev(main, t0);
    			mount_component(nav, main, null);
    			append_dev(main, t1);
    			mount_component(section0, main, null);
    			append_dev(main, t2);
    			mount_component(section1, main, null);
    			append_dev(main, t3);
    			mount_component(section2, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section0_changes.$$scope = { dirty, ctx };
    			}

    			section0.$set(section0_changes);
    			const section1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section1_changes.$$scope = { dirty, ctx };
    			}

    			section1.$set(section1_changes);
    			const section2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section2_changes.$$scope = { dirty, ctx };
    			}

    			section2.$set(section2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hero.$$.fragment, local);
    			transition_in(nav.$$.fragment, local);
    			transition_in(section0.$$.fragment, local);
    			transition_in(section1.$$.fragment, local);
    			transition_in(section2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hero.$$.fragment, local);
    			transition_out(nav.$$.fragment, local);
    			transition_out(section0.$$.fragment, local);
    			transition_out(section1.$$.fragment, local);
    			transition_out(section2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(hero);
    			destroy_component(nav);
    			destroy_component(section0);
    			destroy_component(section1);
    			destroy_component(section2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Hero, Nav, Section, Find, About, Studies });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
