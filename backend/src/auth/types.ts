import type { OktaProfile as BaseOktaProfile } from 'passport-okta-oauth20';

export interface BaseProfile {
  id: string;
  provider:
    | 'google'
    | 'github'
    | 'twitter'
    | 'Slack'
    | 'microsoft'
    | 'okta-social';
}

interface GoogleProfileEmail {
  value: string;
  verified: boolean;
}

export interface GoogleProfile extends BaseProfile {
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: GoogleProfileEmail[];
  photos: { value: string }[];
  provider: 'google';
  _raw: string;
  _json: {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    email_verified: true;
    locale: string;
    hd: string;
  };
}

interface GitHubProfileEmail {
  value: string;
}

export interface GitHubProfile extends BaseProfile {
  displayName: string;
  username: string;
  profileUrl: string;
  photos: { value: string }[];
  provider: 'github';
  emails: GitHubProfileEmail[];
  _raw: string;
  _json: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
    name: string | null;
    company: string | null;
    blog: string | null;
    location: string | null;
    email: string | null;
    hireable: null;
    bio: string | null;
    twitter_username: string | null;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
  };
}

export interface SlackProfile extends BaseProfile {
  user: {
    name: string;
    id: string;
    email: string;
    image_24: string;
    image_32: string;
    image_48: string;
    image_72: string;
    image_192: string;
    image_512: string;
  };
  team: { id: string };
  displayName: string;
}

export interface TwitterProfile extends BaseProfile {
  username: string;
  displayName: string;
  photos: { value: string }[];
  emails: { value: string }[];
  provider: 'twitter';
  _raw: string;
  _json: {
    id: number;
    id_str: string;
    name: string;
    screen_name: string;
    location: string;
    description: string;
    url: string | null;
    entities: { description: [unknown] };
    protected: boolean;
    followers_count: number;
    friends_count: number;
    listed_count: number;
    created_at: string;
    favourites_count: number;
    utc_offset: null | number;
    time_zone: null | string;
    geo_enabled: boolean;
    verified: boolean;
    statuses_count: number;
    lang: null | string;
    status: unknown;
    contributors_enabled: boolean;
    is_translator: boolean;
    is_translation_enabled: boolean;
    profile_background_color: string | null;
    profile_background_image_url: string | null;
    profile_background_image_url_https: string | null;
    profile_background_tile: boolean;
    profile_image_url: string | null;
    profile_image_url_https: string | null;
    profile_link_color: string | null;
    profile_sidebar_border_color: string | null;
    profile_sidebar_fill_color: string | null;
    profile_text_color: string | null;
    profile_use_background_image: boolean;
    has_extended_profile: boolean;
    default_profile: boolean;
    default_profile_image: boolean;
    following: boolean;
    follow_request_sent: boolean;
    notifications: boolean;
    translator_type: string | null;
    suspended: boolean;
    needs_phone_verification: boolean;
    email: string;
  };
  _accessLevel: 'read' | string;
}

export interface MicrosoftProfile extends BaseProfile {
  provider: 'microsoft';
  name: { familyName: string; givenName: string };
  displayName: string;
  emails: Array<{ type: string; value: string }>;
  _raw: string;
  _json: {
    '@odata.context': string;
    businessPhones: string[];
    displayName: string;
    givenName: string;
    jobTitle: string | null;
    mail: string;
    mobilePhone: null;
    officeLocation: null;
    preferredLanguage: string;
    surname: string;
    userPrincipalName: string;
    id: string;
  };
}

export interface OktaProfile extends BaseOktaProfile, BaseProfile {}
