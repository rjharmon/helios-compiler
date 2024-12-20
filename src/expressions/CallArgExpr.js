import { expectDefined } from "@helios-lang/type-utils"
import { Scope } from "../scopes/Scope.js"
import { Expr } from "./Expr.js"

/**
 * @import { Site, Token, Word } from "@helios-lang/compiler-utils"
 * @typedef {import("../typecheck/index.js").EvalEntity} EvalEntity
 */

/**
 * @typedef {{
 *   site: Site
 *   name: string
 *   valueExpr: Expr
 *   value: EvalEntity
 *   isNamed(): boolean
 *   isLiteral(): boolean
 *   toString(): string
 *   eval(scope: Scope): EvalEntity
 * }} CallArgExprI
 */

/**
 * @implements {CallArgExprI}
 */
export class CallArgExpr {
    /**
     * @readonly
     * @type {Site}
     */
    site

    /**
     * @private
     * @readonly
     * @type {Word | undefined}
     */
    _name

    /**
     * @private
     * @readonly
     * @type {Expr}
     */
    _valueExpr

    /**
     * @param {Site} site
     * @param {Word | undefined} name
     * @param {Expr} valueExpr
     */
    constructor(site, name, valueExpr) {
        this.site = site

        this._name = name
        this._valueExpr = valueExpr
    }

    /**
     * @type {string}
     */
    get name() {
        return this._name?.toString() ?? ""
    }

    /**
     * @type {Expr}
     */
    get valueExpr() {
        return this._valueExpr
    }

    /**
     * @type {EvalEntity}
     */
    get value() {
        return expectDefined(this._valueExpr.cache)
    }

    /**
     * @returns {boolean}
     */
    isNamed() {
        return this._name != null
    }

    /**
     * @returns {boolean}
     */
    isLiteral() {
        return this._valueExpr.isLiteral()
    }

    /**
     * @returns {string}
     */
    toString() {
        return [
            this._name != null ? `${this._name.toString()}: ` : "",
            this._valueExpr.toString()
        ].join("")
    }

    /**
     * @param {Scope} scope
     * @returns {EvalEntity}
     */
    eval(scope) {
        return this._valueExpr.eval(scope)
    }
}
