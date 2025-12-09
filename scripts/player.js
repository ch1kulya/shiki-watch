"use strict";

class Player {
  static {
    console.debug("player loading...");
    document.addEventListener("turbolinks:load", () => this.#onViewChanged());
  }

  static lang = "rus";

  static async #onViewChanged() {
    const match = Shikimori.isAnimePage(window.location);
    if (!match) return;

    document.querySelector(".block-with-player")?.remove();

    const animeId = match.groups.id;
    const animeData = Shikimori.getAnimeInfo(animeId);

    if (animeData.status === "anons") {
      console.debug("Anime is not aired yet, player skipped.");
      return;
    }

    if (
      document
        .querySelectorAll(".subheadline")[0]
        ?.textContent.includes("Information")
    ) {
      this.lang = "eng";
    }

    const headline = this.#createHeadline();
    const block = this.#createBlock(headline);
    const beforeForPlayer = document.getElementsByClassName("b-db_entry")[0];
    this.#insertAfter(block, beforeForPlayer);

    Kodik.precreateKodikPlayer(animeId);
  }

  static #createHeadline() {
    const headline = document.createElement("div");
    headline.className = "subheadline";
    headline.textContent = this.lang === "eng" ? "watch" : "смотреть";
    return headline;
  }

  static #createBlock(headline) {
    const block = document.createElement("div");
    block.className = "block block-with-player";
    block.appendChild(headline);
    return block;
  }

  static #insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
  }
}

class Kodik {
  static precreateKodikPlayer(animeId) {
    const block = document.querySelector(".block-with-player");
    if (!block) return;
    block.appendChild(this.#createKodikPlayer(animeId));
  }

  static #createKodikPlayer(animeId) {
    const kodikPlayer = document.createElement("iframe");
    kodikPlayer.width = "100%";
    kodikPlayer.allowFullscreen = true;
    kodikPlayer.src = `//kodik.cc/find-player?shikimoriID=${animeId}&episode=${Shikimori.getWatchingEpisode(animeId)}`;
    kodikPlayer.className = "iframe-player";

    new ResizeObserver(() => {
      kodikPlayer.height = (9 * kodikPlayer.clientWidth) / 16;
    }).observe(kodikPlayer);

    return kodikPlayer;
  }
}

class Shikimori {
  static isAnimePage(location) {
    return location.pathname.match(/\/animes\/[a-z]?(?<id>\d+)-[a-z0-9-]+$/);
  }

  static getAnimeInfo(animeId) {
    const req = new XMLHttpRequest();
    req.open("GET", `${location.origin}/api/animes/${animeId}`, false);
    req.send();
    return JSON.parse(req.response || "{}");
  }

  static getWatchingEpisode(animeId) {
    const response = this.getAnimeInfo(animeId);
    return (response.user_rate?.episodes || 0) + 1;
  }

  static getNameOfAnime(animeId) {
    const response = this.getAnimeInfo(animeId);
    return response.name || response.english?.[0] || response.russian || "";
  }
}
