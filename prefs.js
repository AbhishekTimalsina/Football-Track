import Adw from "gi://Adw";

import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

import { teamsData } from "./teams.js";

let teamDataCopy = { ...teamsData };
export default class ExamplePreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    this._settings = this.getSettings("org.gnome.shell.extensions.footballtrack");

    

    const page = new Adw.PreferencesPage({
      title: _("General"),
      icon_name: "dialog-information-symbolic",
    });

    const parent_container = new Adw.PreferencesGroup({
      title: _("Set your Favourite Team"),
      description: _("Configure the teams that appear in Favourite tab."),
    });

    const searchBox = new Adw.EntryRow({
      title: _("Search your favourite team"),
    });
    window.add(page);

    searchBox.connect("changed", () => {
      let newObj = {};

      Object.keys(teamsData).forEach((d) => {
        if (typeof newObj[d] == "undefined") newObj[d] = [];
        newObj[d] = teamsData[d].filter((el) =>
          el.name.toLowerCase().startsWith(searchBox.text.toLowerCase())
        );
      });

      teamDataCopy = { ...newObj };
      this._createList(parent_container);
    });

    page.add(parent_container);
    parent_container.add(searchBox);

    this._createList(parent_container);
  }

  _createList(parent_container) {
    this.UCL_Group && parent_container.remove(this.UCL_Group);
    this.LaLiga_Group && parent_container.remove(this.LaLiga_Group);
    this.EPL_Group && parent_container.remove(this.EPL_Group);
    this.Ligue1_Group && parent_container.remove(this.Ligue1_Group);
    this.SerieA_Group && parent_container.remove(this.SerieA_Group);
    this.BundesLiga_Group && parent_container.remove(this.BundesLiga_Group);

    const favoriteTeams = this._settings.get_strv("favorite-teams");

    this.UCL_Group = new Adw.PreferencesGroup({
      title: _("UCL"),
    });

    teamDataCopy.UCL_Teams.forEach((team) => {
      const row = new Adw.SwitchRow({
        title: _(team.name),
        active: favoriteTeams.includes(String(team.id)),
      });

      row.connect("notify::active", () => {
        this._updateFavoriteTeams(team.id, row.active);
      });

      this.UCL_Group.add(row);
    });

    this.LaLiga_Group = new Adw.PreferencesGroup({
      title: _("Laliga"),
    });

    teamDataCopy.Laliga_Teams.forEach((team) => {
      const row = new Adw.SwitchRow({
        title: _(team.name),
        active: favoriteTeams.includes(String(team.id)),
      });

      row.connect("notify::active", () => {
        this._updateFavoriteTeams(team.id, row.active);
      });

      this.LaLiga_Group.add(row);
    });

    this.EPL_Group = new Adw.PreferencesGroup({
      title: _("EPL"),
    });

    teamDataCopy.EPL_Teams.forEach((team) => {
      const row = new Adw.SwitchRow({
        title: _(team.name),
        active: favoriteTeams.includes(String(team.id)),
      });

      row.connect("notify::active", () => {
        this._updateFavoriteTeams(team.id, row.active);
      });

      this.EPL_Group.add(row);
    });
    this.SerieA_Group = new Adw.PreferencesGroup({
      title: _("Serie A"),
    });

    teamDataCopy.SerieA_Teams.forEach((team) => {
      const row = new Adw.SwitchRow({
        title: _(team.name),
        active: favoriteTeams.includes(String(team.id)),
      });

      row.connect("notify::active", () => {
        this._updateFavoriteTeams(team.id, row.active);
      });

      this.SerieA_Group.add(row);
    });

    this.Ligue1_Group = new Adw.PreferencesGroup({
      title: _("Ligue 1"),
    });

    teamDataCopy.Ligue1_Teams.forEach((team) => {
      const row = new Adw.SwitchRow({
        title: _(team.name),
        active: favoriteTeams.includes(String(team.id)),
      });

      row.connect("notify::active", () => {
        this._updateFavoriteTeams(team.id, row.active);
      });

      this.Ligue1_Group.add(row);
    });

     this.BundesLiga_Group = new Adw.PreferencesGroup({
      title: _("BundesLiga"),
    });

    teamDataCopy.BundesLiga_Teams.forEach((team) => {
      const row = new Adw.SwitchRow({
        title: _(team.name),
        active: favoriteTeams.includes(String(team.id)),
      });

      row.connect("notify::active", () => {
        this._updateFavoriteTeams(team.id, row.active);
      });

      this.BundesLiga_Group.add(row);
    });

    parent_container.add(this.UCL_Group);
    parent_container.add(this.EPL_Group);
    parent_container.add(this.LaLiga_Group);
    parent_container.add(this.SerieA_Group);
    parent_container.add(this.Ligue1_Group);
    parent_container.add(this.BundesLiga_Group);
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
    favoriteTeams= Array.from(new Set(favoriteTeams)) 
    this._settings.set_strv("favorite-teams", favoriteTeams);
  }

  _isTeamFavorite(teamId) {
    const favoriteTeams = this._settings.get_strv("favorite-teams");
    return favoriteTeams.includes(String(teamId));
  }
}
