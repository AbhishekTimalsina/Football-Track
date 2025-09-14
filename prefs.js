import Adw from "gi://Adw";
import Soup from "gi://Soup";
import GLib from "gi://GLib";

import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";
import { compitionsData } from "./data.js";
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

    this._getTeams();
  }

  _getTeams(){
    this.teamsData= {};
    let pending=compitionsData.length;
    compitionsData.forEach((data,i)=>{
      this._fetchUrl(`https://webws.365scores.com/web/standings/?timezoneName=Asia%2FKathmandu&competitions=${data.compId}`,(err,data)=>{
                pending--; 
                let d = JSON.parse(data);
                 let parsedData= d.standings[0].rows.map(row=> ({name: row.competitor.name, id: row.competitor.name}))
                 this.teamsData[data.name]= parsedData;
                 if(pending===0){
                 }
      })
    })
  }

  _createList(parent_container) {
      this.compGroup && parent_container.remove(this.compGroup)
      
      this.compGroup = new Adw.PreferencesGroup({});

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

    this.compGroup.add(this.UCL_Group);
    this.compGroup.add(this.EPL_Group);
    this.compGroup.add(this.LaLiga_Group);
    this.compGroup.add(this.SerieA_Group);
    this.compGroup.add(this.Ligue1_Group);
    this.compGroup.add(this.BundesLiga_Group);

    parent_container.add(this.compGroup)
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


    _fetchUrl(url, callback) {
      let session = new Soup.Session();

      let message = Soup.Message.new("GET", url);

      session.send_and_read_async(
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