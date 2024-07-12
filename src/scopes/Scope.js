import { CompilerError, Word } from "@helios-lang/compiler-utils"
import { Common } from "../typecheck/index.js"
import { GlobalScope } from "./GlobalScope.js"

/**
 * @typedef {import("../typecheck/index.js").EvalEntity} EvalEntity
 * @typedef {import("../typecheck/index.js").Type} Type
 */

/**
 * User scope
 * @implements {EvalEntity}
 */
export class Scope extends Common {
    /** @type {GlobalScope | Scope} */
    #parent

    /**
     * TopScope can elverage the #values to store ModuleScopes
     * @type {[Word, (EvalEntity | Scope), boolean][]}
     */
    #values

    /**
     * @type {boolean}
     */
    #allowShadowing

    /**
     * @param {GlobalScope | Scope} parent
     * @param {boolean} allowShadowing
     */
    constructor(parent, allowShadowing = false) {
        super()
        this.#parent = parent
        this.#values = [] // list of pairs
        this.#allowShadowing = allowShadowing
    }

    /**
     * @type {boolean}
     */
    get allowShadowing() {
        return this.#allowShadowing
    }

    /**
     * Used by top-scope to loop over all the statements
     */
    get values() {
        return this.#values.slice()
    }

    /**
     * Checks if scope contains a name
     * @param {Word} name
     * @returns {boolean}
     */
    has(name) {
        for (let pair of this.#values) {
            if (pair[0].toString() == name.toString()) {
                return true
            }
        }

        if (this.#parent !== null) {
            return this.#parent.has(name)
        } else {
            return false
        }
    }

    /**
     * Sets a named value. Throws an error if not unique
     * @param {Word} name
     * @param {EvalEntity | Scope} value
     */
    setInternal(name, value, allowShadowing = false) {
        if (value instanceof Scope) {
            if (!name.value.startsWith("__scope__")) {
                throw new Error("unexpected")
            }
        }

        if (this.has(name)) {
            const prevEntity = this.get(name, true)

            if (
                allowShadowing &&
                value.asTyped &&
                prevEntity &&
                !(prevEntity instanceof Scope) &&
                prevEntity.asTyped
            ) {
                if (
                    !(
                        prevEntity.asTyped.type.isBaseOf(value.asTyped.type) &&
                        value.asTyped.type.isBaseOf(prevEntity.asTyped.type)
                    )
                ) {
                    throw CompilerError.syntax(
                        name.site,
                        `'${name.toString()}' already defined`
                    )
                }
            } else {
                throw CompilerError.syntax(
                    name.site,
                    `'${name.toString()}' already defined`
                )
            }
        }

        this.#values.push([name, value, false])
    }

    /**
     * Sets a named value. Throws an error if not unique
     * @param {Word} name
     * @param {EvalEntity | Scope} value
     */
    set(name, value) {
        this.setInternal(name, value, this.#allowShadowing)
    }

    /**
     * @param {Word} name
     */
    remove(name) {
        this.#values = this.#values.filter(([n, _]) => n.value != name.value)
    }

    /**
     * @param {Word} name
     * @returns {null | Scope}
     */
    getScope(name) {
        if (name.value.startsWith("__scope__")) {
            throw new Error("unexpected")
        }

        const entity = this.get(new Word(`__scope__${name.value}`, name.site))

        if (entity instanceof Scope) {
            return entity
        } else if (!entity) {
            throw CompilerError.type(name.site, `expected Scope`)
            return null
        } else {
            throw CompilerError.type(
                name.site,
                `expected Scope, got ${entity.toString()}`
            )
            return null
        }
    }

    /**
     * Gets a named value from the scope. Throws an error if not found
     * @param {Word | string} name
     * @param {boolean} dryRun - if false -> don't set used flag
     * @returns {EvalEntity | Scope}
     */
    get(name, dryRun = false) {
        if (!(name instanceof Word)) {
            name = new Word(name)
        }

        for (let i = this.#values.length - 1; i >= 0; i--) {
            const [key, entity, _] = this.#values[i]

            if (key.toString() == name.toString()) {
                if (!dryRun) {
                    this.#values[i][2] = true
                }
                return entity
            }
        }

        if (this.#parent !== null) {
            if (this.#parent instanceof GlobalScope) {
                return this.#parent.get(name)
            } else {
                return this.#parent.get(name, dryRun)
            }
        } else {
            throw CompilerError.reference(
                name.site,
                `'${name.toString()}' undefined`
            )
        }
    }

    /**
     * @returns {boolean}
     */
    isStrict() {
        return this.#parent.isStrict()
    }

    /**
     * Asserts that all named values are user.
     * Throws an error if some are unused.
     * Check is only run if we are in strict mode
     * @param {boolean} onlyIfStrict
     */
    assertAllUsed(onlyIfStrict = true) {
        if (!onlyIfStrict || this.isStrict()) {
            for (let [name, entity, used] of this.#values) {
                if (!(entity instanceof Scope) && !used) {
                    throw CompilerError.reference(
                        name.site,
                        `'${name.toString()}' unused`
                    )
                }
            }
        }
    }

    /**
     * @param {Word} name
     * @returns {boolean}
     */
    isUsed(name) {
        for (let [checkName, entity, used] of this.#values) {
            if (name.value == checkName.value && !(entity instanceof Scope)) {
                return used
            }
        }

        throw new Error(`${name.value} not found`)
    }

    /**
     * @param {(name: string, type: Type) => void} callback
     */
    loopTypes(callback) {
        this.#parent.loopTypes(callback)

        for (let [k, v] of this.#values) {
            if (v.asType) {
                callback(k.value, v.asType)
            }
        }
    }
}
