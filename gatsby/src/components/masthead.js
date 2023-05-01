import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

const Masthead = () => {
    return (
        <div class="masthead">
            <div class="masthead__inner-wrap">
                <div class="masthead__menu">
                    <nav id="site-nav" class="greedy-nav">
                        <a class="site-logo" href="/">
                            <StaticImage
                                src="../images/logo-header.png"
                            />
                        </a>
                        <a class="site-title" href="/">
                            Davi Cruz
                        </a>
                        <ul class="visible-links">
                            <li class="masthead__menu-item">
                                <a href="/categorias/">Categorias</a>
                            </li>
                            <li class="masthead__menu-item">
                                <a href="/tags/">Tags</a>
                            </li>
                            <li class="masthead__menu-item">
                                <a href="/sobre/">Sobre</a>
                            </li>
                        </ul>
                        <button class="search__toggle" type="button">
                            <span class="visually-hidden">Chavear busca</span>
                            <i class="fas fa-search"></i>
                        </button>
                        <button class="greedy-nav__toggle hidden" type="button">
                            <span class="visually-hidden">Chavear menu</span>
                            <div class="navicon"></div>
                        </button>
                        <ul class="hidden-links hidden"></ul>
                    </nav>
                </div>
            </div>
        </div>
    )
}

export default Masthead
