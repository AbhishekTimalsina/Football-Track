import Adw from "gi://Adw";
import Soup from "gi://Soup";
import GLib from "gi://GLib";

import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";
import { compitionsData } from "./data.js";

export default class ExamplePreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    this._settings = this.getSettings(
      "org.gnome.shell.extensions.footballtrack"
    );

    const page = new Adw.PreferencesPage({
      title: _("General"),
      icon_name: "dialog-information-symbolic",
    });

    let parent_container = new Adw.PreferencesGroup({
      title: _("Set your Favourite Team"),
      description: _("Configure the teams that appear in Favourite tab."),
    });

    const searchBox = new Adw.EntryRow({
      title: _("Search your favourite team"),
    });

    this._session = new Soup.Session();

    window.add(page);
    this.teamsData = {};
    this.teamsDataCopy = {};

    searchBox.connect("changed", () => {
      let newObj = {};

      Object.keys(this.teamsDataCopy).forEach((d) => {
        if (typeof newObj[d] == "undefined") newObj[d] = [];
        newObj[d] = this.teamsDataCopy[d].filter((el) =>
          el.name.toLowerCase().startsWith(searchBox.text.toLowerCase())
        );
      });

      this.teamsData = { ...newObj };
      this._createList(parent_container);
    });

    page.add(parent_container);
    let spinner = new Adw.Spinner({});

    spinner.set_margin_top(100);
    spinner.set_size_request(50, 50);
    parent_container.add(searchBox);
    parent_container.add(spinner);

    this._getTeams(parent_container, spinner);

    window.connect("close-request", () => {
      if (this._session) {
        this._session.abort();
      }
      if (this.compGroup) {
        parent_container.remove(this.compGroup);
        this.compGroup = null;
      }
      this.teamsData = {};
      this.teamsDataCopy = {};
      return false;
    });
  }

  _getTeams(parent_container, spinner) {
    let teamList = this._settings.get_string("teams");

    teamList = JSON.parse(teamList);

    if (teamList.length !== 0) {
      this.teamsData = teamList;
      this.teamsDataCopy = teamList;
      parent_container.remove(spinner);
      this._createList(parent_container);
      return;
    }

    this.teamsData = {};
    let pending = compitionsData.length;
    console.log(compitionsData);
    compitionsData.forEach((comp, i) => {
      this._fetchUrl(
        `https://webws.365scores.com/web/standings/?timezoneName=Asia/Kathmandu&competitions=${comp.compId}`,
        (err, dt) => {
          pending--;
          if (!dt) return;
          let d = JSON.parse(dt).standings[0].rows;

          let parsedData = d.map((row) => ({
            name: row.competitor.name,
            id: row.competitor.id,
          }));
          this.teamsData[comp.name] = parsedData;
          this.teamsDataCopy[comp.name] = parsedData;
          if (pending === 0) {
            parent_container.remove(spinner);
            this._createList(parent_container);
            this._settings.set_string("teams", JSON.stringify(this.teamsData));
          }
        }
      );
    });
  }

  _createList(parent_container) {
    this.compGroup && parent_container.remove(this.compGroup);

    this.compGroup = new Adw.PreferencesGroup({});

    const favoriteTeams = this._settings.get_strv("favorite-teams");

    Object.keys(this.teamsData).forEach((comp) => {
      let team = this.teamsData[comp];

      let cmp_grp = new Adw.PreferencesGroup({
        title: _(comp),
      });

      team.forEach((t) => {
        const row = new Adw.SwitchRow({
          title: _(t.name),
          active: favoriteTeams.includes(String(t.id)),
        });

        row.connect("notify::active", () => {
          this._updateFavoriteTeams(t.id, row.active);
        });

        cmp_grp.add(row);
        this.compGroup.add(cmp_grp);
      });
    });

    parent_container.add(this.compGroup);
  }

  _updateFavoriteTeams(teamId, isActive) {
    let favoriteTeams = this._settings.get_strv("favorite-teams");

    if (isActive) {
      if (!favoriteTeams.includes(String(teamId))) {
        favoriteTeams.push(String(teamId));
      }
    } else {
      favoriteTeams = favoriteTeams.filter((id) => id !== String(teamId));
    }
    favoriteTeams = Array.from(new Set(favoriteTeams));
    this._settings.set_strv("favorite-teams", favoriteTeams);
  }

  _isTeamFavorite(teamId) {
    const favoriteTeams = this._settings.get_strv("favorite-teams");
    return favoriteTeams.includes(String(teamId));
  }

  _fetchUrl(url, callback) {
    let message = Soup.Message.new("GET", url);

    this._session.send_and_read_async(
      message,
      GLib.PRIORITY_DEFAULT,
      null,
      (session, res) => {
        try {
          let bytes = session.send_and_read_finish(res);
          let data = new TextDecoder().decode(bytes.get_data());

          callback(null, data);
        } catch (e) {
          callback(e, null);
        }
      }
    );
  }
}
